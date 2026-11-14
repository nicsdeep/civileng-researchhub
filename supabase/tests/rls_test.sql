-- Row Level Security checks for the researchhub schema (two users + anonymous).
-- Run with: supabase/tests/run-rls-tests.sh
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
\echo '1. User A saves a paper and creates a collection (user_id filled automatically)'
set role authenticated; select set_config('request.jwt.claim.sub', :'A', false);
insert into researchhub.saved_works (work_id, title, year) values ('W2124937094', 'Durability of recycled aggregate concrete', 2012);
insert into researchhub.collections (name) values ('Thesis sources');
insert into researchhub.collection_items select c.id, w.id from researchhub.collections c, researchhub.saved_works w;
select count(*) as a_sees_own_works from researchhub.saved_works;
select count(*) as a_sees_own_items from researchhub.collection_items;
\echo '2. User B cannot see, change or delete A''s data'
select set_config('request.jwt.claim.sub', :'B', false);
select count(*) as b_sees_works from researchhub.saved_works;
select count(*) as b_sees_collections from researchhub.collections;
select count(*) as b_sees_items from researchhub.collection_items;
with u as (update researchhub.saved_works set title = 'hacked' returning 1) select count(*) as b_updated from u;
with d as (delete from researchhub.saved_works returning 1) select count(*) as b_deleted from d;
\echo '3. User B cannot insert rows owned by A (expect error)'
\set ON_ERROR_STOP 0
insert into researchhub.saved_works (user_id, work_id, title) values (:'A', 'W1', 'forged');
\echo '4. User B cannot put A''s paper into B''s own collection (expect error)'
insert into researchhub.collections (name) values ('B list');
reset role; select id as a_work from researchhub.saved_works \gset
set role authenticated; select set_config('request.jwt.claim.sub', :'B', false);
insert into researchhub.collection_items select c.id, :'a_work' from researchhub.collections c;
\echo '5. User B cannot hand their own row over to A (expect error)'
insert into researchhub.saved_works (work_id, title) values ('W5', 'B paper');
update researchhub.saved_works set user_id = :'A';
\echo '6. Invalid data is rejected (expect errors)'
insert into researchhub.saved_works (work_id, title) values ('not-an-id', 'x');
insert into researchhub.collections (name) values ('   ');
\echo '7. Anonymous visitors have no access (expect permission denied)'
reset role; set role anon;
select count(*) from researchhub.saved_works;
\echo '8. Final state as superuser: A still has exactly 1 untouched paper'
reset role; select user_id = :'A' as owned_by_a, title from researchhub.saved_works order by created_at;
