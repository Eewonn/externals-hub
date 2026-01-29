-- ============================================================================
-- DIAGNOSTIC TEST - Run this to see what's actually happening
-- ============================================================================

-- Test 1: Check if the function works
SELECT public.is_event_upcoming('9aad35b0-e186-47d2-8419-64b1d1d5dc71');
-- Expected: Should return true if event exists and is upcoming

-- Test 2: Check what role you're using when inserting
SELECT current_user, session_user;
-- Expected: Should show 'anon' if you're using the anon key

-- Test 3: Try to insert as postgres (should work)
INSERT INTO public.event_applications (
  event_id,
  full_name,
  student_number,
  student_email,
  acm_membership_status,
  course_year_level
) VALUES (
  '9aad35b0-e186-47d2-8419-64b1d1d5dc71',
  'Test User Postgres',
  '2021-12345',
  'test-postgres@example.com',
  'no',
  'BS Computer Science - 3rd Year'
);
-- Expected: Should work because postgres bypasses RLS

-- Test 4: Check if anon role can execute the function
SET ROLE anon;
SELECT public.is_event_upcoming('9aad35b0-e186-47d2-8419-64b1d1d5dc71');
RESET ROLE;
-- Expected: Should return true

-- Test 5: Try insert as anon role directly
SET ROLE anon;
INSERT INTO public.event_applications (
  event_id,
  full_name,
  student_number,
  student_email,
  acm_membership_status,
  course_year_level
) VALUES (
  '9aad35b0-e186-47d2-8419-64b1d1d5dc71',
  'Test User Anon',
  '2021-54321',
  'test-anon@example.com',
  'yes',
  'BS Computer Science - 4th Year'
);
RESET ROLE;
-- Expected: This is where it should fail if there's an RLS issue

-- Test 6: Check the actual policy definition
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'event_applications'
AND cmd = 'INSERT';
