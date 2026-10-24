-- Row Level Security checks. Run against a database where 0001_init.sql has been applied.
-- Each block raises an exception if a rule is broken; success prints "ALL RLS CHECKS PASSED".
\set ON_ERROR_STOP 1

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin@example.com'),
  ('00000000-0000-0000-0000-0000000000b2', 'visitor@example.com')
on conflict do nothing;
insert into public.admins (user_id, email) values ('00000000-0000-0000-0000-0000000000a1', 'admin@example.com') on conflict do nothing;

insert into public.portfolio_projects (title, slug, category_id, is_published)
select 'Published Test', 'published-test', id, true from public.portfolio_categories where slug = 'wedding'
on conflict do nothing;
insert into public.portfolio_projects (title, slug, category_id, is_published)
select 'Draft Test', 'draft-test', id, false from public.portfolio_categories where slug = 'wedding'
on conflict do nothing;
insert into public.payment_records (reference, amount_paise) values ('PR-TEST0001', 50000) on conflict do nothing;

-- ── Anonymous visitor ──
begin;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$
declare n int;
begin
  select count(*) into n from public.portfolio_projects where slug = 'draft-test';
  if n <> 0 then raise exception 'anon can see draft projects'; end if;
  select count(*) into n from public.portfolio_projects where slug = 'published-test';
  if n <> 1 then raise exception 'anon cannot see published projects'; end if;
  select count(*) into n from public.payment_records;
  if n <> 0 then raise exception 'anon can read payment records'; end if;
  update public.website_settings set tagline = 'hacked' where id = 1;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'anon can update settings'; end if;
  insert into public.booking_inquiries (id, full_name, whatsapp_number, event_type, event_city, state, message)
  values (gen_random_uuid(), 'Test Visitor', '919876543210', 'Wedding Photography', 'Raipur', 'Chhattisgarh', 'Testing the booking insert');
  begin
    insert into public.booking_inquiries (full_name, whatsapp_number, event_type, event_city, state, message, status)
    values ('Bad', '919876543210', 'Wedding', 'Raipur', 'Chhattisgarh', 'Trying to set status', 'confirmed');
    raise exception 'anon could set inquiry status';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.booking_inquiries (full_name, whatsapp_number, event_type, event_city, state, message, internal_notes)
    values ('Bad', '919876543210', 'Wedding', 'Raipur', 'Chhattisgarh', 'Trying to set notes', 'x');
    raise exception 'anon could write internal notes';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.booking_inquiries;
    raise exception 'anon could read inquiries';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;

-- ── Signed-in user who is NOT an admin ──
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b2', true);
do $$
declare n int;
begin
  select count(*) into n from public.booking_inquiries;
  if n <> 0 then raise exception 'non-admin can read inquiries'; end if;
  select count(*) into n from public.portfolio_projects where slug = 'draft-test';
  if n <> 0 then raise exception 'non-admin can see drafts'; end if;
  delete from public.portfolio_projects;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'non-admin can delete projects'; end if;
  begin
    insert into public.admins (user_id, email) values ('00000000-0000-0000-0000-0000000000b2', 'visitor@example.com');
    raise exception 'non-admin could make themselves admin';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;

-- ── Administrator ──
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
do $$
declare n int;
begin
  select count(*) into n from public.booking_inquiries;
  if n < 1 then raise exception 'admin cannot read inquiries'; end if;
  select count(*) into n from public.portfolio_projects where slug = 'draft-test';
  if n <> 1 then raise exception 'admin cannot see drafts'; end if;
  update public.website_settings set whatsapp_number = '+91 98765 43210' where id = 1;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'admin cannot update settings'; end if;
  select count(*) into n from public.payment_records;
  if n < 1 then raise exception 'admin cannot read payments'; end if;
  begin
    delete from public.portfolio_categories where slug = 'wedding';
    raise exception 'category with projects was deleted';
  exception when foreign_key_violation then null;
  end;
end $$;
rollback;

select 'ALL RLS CHECKS PASSED' as result;
