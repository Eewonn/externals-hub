-- DIAGNOSTIC: Run these queries to understand what's happening
-- Run each section separately to diagnose the issue

-- 1. Check current policies on event_applications
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'event_applications';

-- 2. Check current policies on events table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'events';

-- 3. Check table permissions for anon role
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'event_applications' AND grantee = 'anon';

SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'events' AND grantee = 'anon';

-- 4. Test if anon can read from events table
-- This should return rows if permissions are correct
SET ROLE anon;
SELECT id, title, status FROM public.events WHERE status = 'upcoming' LIMIT 5;
RESET ROLE;

-- 5. Check if the is_event_upcoming function works
SELECT public.is_event_upcoming('9aad35b0-e186-47d2-8419-64b1d1d5dc71');
