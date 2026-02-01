-- Diagnose the NULL role issue

-- 1. Check your auth user ID
SELECT auth.uid() as my_auth_id;

-- 2. Check all users and their roles
SELECT id, email, full_name, role, created_at FROM public.users ORDER BY created_at DESC;

-- 3. Check if your auth ID matches a user record
SELECT 
  auth.uid() as auth_id,
  u.id as user_record_id,
  u.email,
  u.role,
  CASE 
    WHEN u.id IS NULL THEN 'NO USER RECORD FOUND - This is the problem!'
    WHEN u.role IS NULL THEN 'User exists but role is NULL - Need to set role'
    ELSE 'User and role exist'
  END as status
FROM public.users u
WHERE u.id = auth.uid();

-- ============================================================================
-- FIXES - Run the appropriate one based on diagnosis above
-- ============================================================================

-- FIX 1: If you have no user record at all, create one
-- Replace with your actual email from auth
-- INSERT INTO public.users (id, email, full_name, role)
-- VALUES (
--   auth.uid(),
--   'your.email@example.com',
--   'Your Name',
--   'vp_externals'
-- );

-- FIX 2: If user exists but role is NULL, update it
-- This updates YOUR current user's role
UPDATE public.users
SET role = 'vp_externals'
WHERE id = auth.uid();

-- FIX 3: If auth.uid() doesn't match but you know your email, update by email
-- Replace with your actual email
-- UPDATE public.users
-- SET role = 'vp_externals'
-- WHERE email = 'your.email@example.com';

-- After running the fix, verify it worked:
-- SELECT public.get_user_role(auth.uid()) as my_role;
