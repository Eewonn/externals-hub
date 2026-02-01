-- ============================================================================
-- DROP AND RECREATE RLS POLICIES
-- ============================================================================
-- Run this to fix policy conflicts and update existing policies

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can insert their own profile during signup" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "VPs and advisers can view all users" ON users;
DROP POLICY IF EXISTS "VPs can insert users" ON users;
DROP POLICY IF EXISTS "VPs and advisers can update users" ON users;
DROP POLICY IF EXISTS "VPs can delete users" ON users;

-- Recreate users table policies without approval_status
CREATE POLICY "Users can insert their own profile during signup"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  role = (SELECT role FROM public.users WHERE id = auth.uid())
);

CREATE POLICY "VPs and advisers can view all users"
ON users FOR SELECT
USING (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'adviser')
);

CREATE POLICY "VPs can insert users"
ON users FOR INSERT
WITH CHECK (
  public.get_user_role(auth.uid()) = 'vp_externals'
);

CREATE POLICY "VPs and advisers can update users"
ON users FOR UPDATE
USING (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'adviser')
);

CREATE POLICY "VPs can delete users"
ON users FOR DELETE
USING (
  public.get_user_role(auth.uid()) = 'vp_externals'
);
