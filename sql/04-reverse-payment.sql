-- STEP 4. Run ONCE in Supabase > SQL Editor (optional but recommended)
-- Allows the authenticated owner to reverse an erroneous payment, record an audit log, and update bill status.

create or replace function owner_reverse_payment(p_payment_id bigint, p_note text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  p record;
  n text := coalesce(trim(p_note), 'Reversed by owner');
begin
  if auth.role() <> 'authenticated' then raise exception 'Owner only'; end if;
  select * into p from payments where id = p_payment_id;
  if p.id is null then return jsonb_build_object('err', 'Payment not found'); end if;
  if p.reversed then return jsonb_build_object('err', 'Payment already reversed'); end if;

  update payments
     set reversed = true,
         ref = left(coalesce(ref || ' [Reversed: ' || n || ']', '[Reversed: ' || n || ']'), 60)
   where id = p_payment_id;

  perform refresh_bill(p.bill_code);

  insert into audit(who, action, code, old, new)
  values(
    coalesce(auth.jwt()->>'email', 'owner'),
    'payment_reversed',
    p.bill_code,
    jsonb_build_object('payment_id', p.id, 'amount', p.amount, 'method', p.method),
    jsonb_build_object('note', n)
  );

  return jsonb_build_object('ok', true, 'bill_code', p.bill_code);
end$$;

revoke execute on function owner_reverse_payment(bigint, text) from public, anon;
grant execute on function owner_reverse_payment(bigint, text) to authenticated;
