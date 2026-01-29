-- Add DELETE policy for users table
-- Only VP Externals can delete users
CREATE POLICY "VP Externals can delete users"
  ON public.users FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );
