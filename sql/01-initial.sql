-- Run once in Supabase: SQL Editor > New query > paste > Run
create table settings(id int primary key default 1 check(id=1), rates jsonb not null, driver_pin text not null);
insert into settings values(1,'{"confirmed":false,"outKm":13,"minKm":250,"bhatta":300,"night":300,"l8":2400,"l12":3000,"xKm":14,"xHr":150,"owKm":16,"wait":100}','0011');

create table bills(
  no bigint generated always as identity,
  code text primary key default upper(substr(md5(gen_random_uuid()::text),1,8)),
  created_at timestamptz default now(),
  data jsonb not null,
  status text not null default 'Pending',
  fb jsonb);

alter table settings enable row level security;
alter table bills enable row level security;
-- only the logged-in owner can read or change tables directly
create policy owner_settings on settings for all to authenticated using(true) with check(true);
create policy owner_bills on bills for all to authenticated using(true) with check(true);

-- driver and customer pages can only use these functions
create function get_rates(p_pin text) returns jsonb language sql security definer set search_path=public as
$$select rates from settings where driver_pin=p_pin$$;

create function driver_save(p_pin text,p_data jsonb) returns text language plpgsql security definer set search_path=public as
$$declare c text; begin
  if not exists(select 1 from settings where driver_pin=p_pin) then raise exception 'Wrong PIN'; end if;
  insert into bills(data) values(p_data) returning code into c; return c; end$$;

create function driver_recent(p_pin text) returns jsonb language sql security definer set search_path=public as
$$select coalesce(jsonb_agg(x),'[]'::jsonb) from (select b.no,b.code,b.data->>'cust' as cust,(b.data->>'total')::numeric as total
  from bills b, settings s where s.driver_pin=p_pin order by b.no desc limit 8) x$$;

create function get_bill(p_code text) returns jsonb language sql security definer set search_path=public as
$$select to_jsonb(b)-'created_at' from bills b where code=upper(p_code)$$;

create function send_feedback(p_code text,p_fb jsonb) returns void language sql security definer set search_path=public as
$$update bills set fb=p_fb where code=upper(p_code) and fb is null$$;

grant execute on function get_rates, driver_save, driver_recent, get_bill, send_feedback to anon;
