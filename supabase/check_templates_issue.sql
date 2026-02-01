-- Diagnostic queries for templates not showing up issue

-- 1. Check if RLS is enabled on templates table
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'templates';

-- 2. Check all templates in the database (bypassing RLS)
SELECT 
  id,
  title,
  category,
  created_by,
  created_at
FROM public.templates;

-- 3. Check your user information and role
SELECT 
  id, 
  email, 
  full_name, 
  role 
FROM public.users;

-- 4. Check if created_by references are valid
SELECT 
  t.id,
  t.title,
  t.created_by,
  CASE 
    WHEN u.id IS NULL THEN 'No matching user (INVALID)'
    ELSE 'User exists: ' || u.email
  END as creator_status
FROM public.templates t
LEFT JOIN public.users u ON t.created_by = u.id;

-- 5. Test the RLS policies - Check what templates current user can see
-- (Run this while logged in)
-- SELECT * FROM templates;

-- 6. Check the get_user_role function
SELECT public.get_user_role(auth.uid()) as my_role;

-- 7. View all RLS policies on templates table
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
WHERE tablename = 'templates';

-- POTENTIAL FIXES:

-- Fix 1: If created_by is invalid (similar to events issue)
-- UPDATE public.templates
-- SET created_by = 'YOUR_USER_ID'
-- WHERE created_by NOT IN (SELECT id FROM public.users);

-- Fix 2: If you need to grant broader access temporarily
-- DROP POLICY IF EXISTS "VP can create templates" ON templates;
-- CREATE POLICY "Authorized users can create templates"
-- ON templates FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships')
-- );
