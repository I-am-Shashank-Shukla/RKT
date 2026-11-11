-- Run ONCE in Supabase > SQL Editor. Safe to run again. Do not re-run the first script.
alter table bills add column if not exists paid_via text, add column if not exists paid_at timestamptz;

create or replace function driver_mark_paid(p_pin text,p_code text,p_via text) returns void
language plpgsql security definer set search_path=public as
$$begin
  if not exists(select 1 from settings where driver_pin=p_pin) then raise exception 'Wrong PIN'; end if;
  if p_via not in ('Cash','UPI') then raise exception 'Bad payment type'; end if;
  update bills set status='Paid', paid_via=p_via, paid_at=now() where code=upper(p_code);
end$$;

create or replace function driver_recent(p_pin text) returns jsonb language sql security definer set search_path=public as
$$select coalesce(jsonb_agg(x),'[]'::jsonb) from (
  select b.no,b.code,b.status,b.data->>'cust' as cust,(b.data->>'total')::numeric as total
  from bills b, settings s where s.driver_pin=p_pin order by b.no desc limit 8) x$$;

grant execute on function driver_mark_paid, driver_recent to anon;
