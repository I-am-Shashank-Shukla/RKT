-- STEP 3. Run ONCE in Supabase > SQL Editor (safe to run again). Keeps all existing bills.
create extension if not exists pgcrypto with schema extensions;
alter table bills add column if not exists paid_via text, add column if not exists paid_at timestamptz;
alter table bills alter column code set default upper(substr(md5(gen_random_uuid()::text),1,12));

-- 1) Driver PIN is stored hashed, with lock-out after repeated wrong tries
alter table settings add column if not exists pin_hash text;
alter table settings alter column driver_pin drop not null;
update settings set pin_hash=extensions.crypt(driver_pin,extensions.gen_salt('bf')) where pin_hash is null and driver_pin is not null;
update settings set driver_pin=null;
create table if not exists pin_attempts(at timestamptz default now());
alter table pin_attempts enable row level security;

create or replace function chk_pin(p text) returns text language plpgsql security definer set search_path=public,extensions as $$
declare h text;
begin
  if (select count(*) from pin_attempts where at>now()-interval '15 minutes')>=8 then return 'locked'; end if;
  select pin_hash into h from settings where id=1;
  if h is null or p is null or crypt(p,h)<>h then insert into pin_attempts default values; return 'bad'; end if;
  delete from pin_attempts where at<now()-interval '1 day'; return 'ok';
end$$;

-- 2) Payments ledger (partial payments: cash / UPI / bank)
create table if not exists payments(id bigint generated always as identity primary key, bill_code text not null references bills(code) on delete cascade,
  amount numeric not null check(amount>0), method text not null check(method in('Cash','UPI','Bank')), ref text, at timestamptz default now(), by text, reversed boolean not null default false);
alter table payments enable row level security;
drop policy if exists owner_payments on payments; create policy owner_payments on payments for all to authenticated using(true) with check(true);
insert into payments(bill_code,amount,method,by) select code,(data->>'total')::numeric-(data->>'adv')::numeric,coalesce(nullif(paid_via,'Owner'),'Cash'),'migrated' from bills b
 where status='Paid' and (data->>'total')::numeric-(data->>'adv')::numeric>0 and not exists(select 1 from payments p where p.bill_code=b.code);

create or replace function refresh_bill(p_code text) returns void language plpgsql security definer set search_path=public as $$
declare t numeric; a numeric; p numeric;
begin
  select (data->>'total')::numeric,coalesce((data->>'adv')::numeric,0) into t,a from bills where code=p_code;
  select coalesce(sum(amount),0) into p from payments where bill_code=p_code and not reversed;
  update bills set status=case when a+p>=t then 'Paid' when a+p>0 then 'Partial' else 'Pending' end,
    paid_via=(select method from payments where bill_code=p_code and not reversed order by id desc limit 1),
    paid_at=case when a+p>=t then coalesce(paid_at,now()) end where code=p_code;
end$$;

-- 3) Server-side fare check (same formulas as the website)
create or replace function calc_total(f jsonb,r jsonb) returns numeric language plpgsql immutable as $$
declare km numeric:=greatest(0,(f->>'end')::numeric-(f->>'start')::numeric); ty text:=f->>'type'; d numeric:=greatest(1,coalesce((f->>'days')::numeric,1));
  h numeric:=coalesce((f->>'hours')::numeric,0); lim numeric:=coalesce((f->>'limit')::numeric,0); t numeric:=0; pk numeric; ph numeric;
begin
  if ty='out' then t:=round(greatest(km,d*(r->>'minKm')::numeric)*(r->>'outKm')::numeric)+round(d*(r->>'bhatta')::numeric);
  elsif ty in('l8','l12') then ph:=case when ty='l8' then 8 else 12 end; pk:=case when ty='l8' then 80 else 120 end;
    t:=round((r->>ty)::numeric)+round(greatest(0,km-pk)*(r->>'xKm')::numeric)+round(greatest(0,h-ph)*(r->>'xHr')::numeric);
  elsif ty='ow' then t:=round(km*(r->>'owKm')::numeric);
  elsif ty='fixed' then t:=round(coalesce((f->>'fixed')::numeric,0))+case when lim>0 then round(greatest(0,km-lim)*(r->>'xKm')::numeric) else 0 end;
  else raise exception 'bad type'; end if;
  return t+round(coalesce((f->>'nights')::numeric,0)*(r->>'night')::numeric)+round(coalesce((f->>'wait')::numeric,0)*(r->>'wait')::numeric)
    +round(coalesce((f->>'toll')::numeric,0))+round(coalesce((f->>'other')::numeric,0));
end$$;

-- 4) Driver functions (replace the old ones; they return {err:...} instead of crashing)
drop function if exists driver_save(text,jsonb); drop function if exists driver_recent(text); drop function if exists driver_mark_paid(text,text,text);
create or replace function get_rates(p_pin text) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare c text:=chk_pin(p_pin);
begin if c<>'ok' then return jsonb_build_object('err',c); end if; return (select rates from settings where id=1); end$$;

create function driver_save(p_pin text,p_data jsonb) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare c text:=chk_pin(p_pin); r jsonb; k text; tot numeric;
begin
  if c<>'ok' then return jsonb_build_object('err',c); end if;
  select rates into r from settings where id=1;
  if coalesce(r->>'confirmed','false')<>'true' then return jsonb_build_object('err','rates'); end if;
  if coalesce(p_data->>'cust','')='' or coalesce(p_data->>'phone','')!~'^\d{10}$' or (p_data->>'end')::numeric<=(p_data->>'start')::numeric or (p_data->>'end')::numeric-(p_data->>'start')::numeric>5000 then return jsonb_build_object('err','bad'); end if;
  foreach k in array array['start','toll','other','nights','wait','adv','fixed','limit','hours'] loop
    if coalesce((p_data->>k)::numeric,0)<0 or coalesce((p_data->>k)::numeric,0)>10000000 then return jsonb_build_object('err','bad'); end if; end loop;
  tot:=calc_total(p_data,r);
  if abs(tot-(p_data->>'total')::numeric)>3 or tot>10000000 or coalesce((p_data->>'adv')::numeric,0)>tot then return jsonb_build_object('err','total'); end if;
  insert into bills(data,status) values(p_data,case when coalesce((p_data->>'adv')::numeric,0)>=tot then 'Paid' when coalesce((p_data->>'adv')::numeric,0)>0 then 'Partial' else 'Pending' end) returning code into c;
  return jsonb_build_object('code',c);
end$$;

create function driver_recent(p_pin text) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare c text:=chk_pin(p_pin);
begin if c<>'ok' then return jsonb_build_object('err',c); end if;
  return (select coalesce(jsonb_agg(x),'[]'::jsonb) from (select no,code,status,data->>'cust' as cust,(data->>'total')::numeric as total from bills order by no desc limit 8) x); end$$;

create or replace function driver_add_payment(p_pin text,p_code text,p_amt numeric,p_method text,p_ref text) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare c text:=chk_pin(p_pin); due numeric;
begin
  if c<>'ok' then return jsonb_build_object('err',c); end if;
  select (data->>'total')::numeric-coalesce((data->>'adv')::numeric,0)-coalesce((select sum(amount) from payments where bill_code=b.code and not reversed),0) into due from bills b where code=upper(p_code);
  if due is null or p_amt<=0 or p_method not in('Cash','UPI','Bank') then return jsonb_build_object('err','bad'); end if;
  if p_amt>due+0.001 then return jsonb_build_object('err','over'); end if;
  insert into payments(bill_code,amount,method,ref,by) values(upper(p_code),p_amt,p_method,left(p_ref,40),'driver'); perform refresh_bill(upper(p_code));
  return jsonb_build_object('ok',true);
end$$;

create or replace function get_bill(p_code text) returns jsonb language sql security definer set search_path=public as $$
select to_jsonb(b)-'created_at'||jsonb_build_object('paid',coalesce((select sum(amount) from payments where bill_code=b.code and not reversed),0)) from bills b where code=upper(p_code)$$;

create or replace function owner_set_pin(p text) returns void language plpgsql security definer set search_path=public,extensions as $$
begin
  if auth.role()<>'authenticated' then raise exception 'Owner only'; end if;
  if p!~'^\d{4,8}$' then raise exception 'PIN must be 4 to 8 digits'; end if;
  update settings set pin_hash=crypt(p,gen_salt('bf')),driver_pin=null where id=1; delete from pin_attempts;
end$$;

-- 5) Audit log of owner edits and deletes
create table if not exists audit(id bigint generated always as identity primary key,at timestamptz default now(),who text,action text,code text,old jsonb,new jsonb);
alter table audit enable row level security;
drop policy if exists owner_audit on audit; create policy owner_audit on audit for select to authenticated using(true);
create or replace function log_bill() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='DELETE' then insert into audit(who,action,code,old) values(coalesce(auth.jwt()->>'email','system'),'delete',old.code,to_jsonb(old));
  elsif old.data is distinct from new.data then insert into audit(who,action,code,old,new) values(coalesce(auth.jwt()->>'email','system'),'edit',old.code,old.data,new.data); end if;
  return null;
end$$;
drop trigger if exists bill_audit on bills; create trigger bill_audit after update or delete on bills for each row execute function log_bill();

-- 6) Permissions
revoke execute on function owner_set_pin(text), refresh_bill(text), chk_pin(text), log_bill() from public, anon;
grant execute on function owner_set_pin(text), refresh_bill(text) to authenticated;
grant execute on function get_rates(text), driver_save(text,jsonb), driver_recent(text), driver_add_payment(text,text,numeric,text,text), get_bill(text), send_feedback(text,jsonb) to anon, authenticated;
