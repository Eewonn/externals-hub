-- Step 1: Check your current role
SELECT id, email, full_name, role FROM public.users;

-- Step 2: Check if any templates exist
SELECT id, title, category, created_by, created_at FROM public.templates;

-- Step 3: Check your role via the function
SELECT public.get_user_role(auth.uid()) as my_role;

-- ============================================================================
-- FIX OPTIONS (Choose ONE based on what you need)
-- ============================================================================

-- OPTION 1: Update your role to vp_externals
-- Replace 'YOUR_EMAIL@example.com' with your actual email
-- UPDATE public.users
-- SET role = 'vp_externals'
-- WHERE email = 'YOUR_EMAIL@example.com';

-- OPTION 2: Allow directors to create/manage templates too
-- (This updates the policies to allow director roles as well)
DROP POLICY IF EXISTS "VP can create templates" ON templates;
DROP POLICY IF EXISTS "VP can update templates" ON templates;
DROP POLICY IF EXISTS "VP can delete templates" ON templates;

CREATE POLICY "Authorized users can create templates"
ON templates FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships')
);

CREATE POLICY "Authorized users can update templates"
ON templates FOR UPDATE
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships')
);

CREATE POLICY "Authorized users can delete templates"
ON templates FOR DELETE
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships')
);
