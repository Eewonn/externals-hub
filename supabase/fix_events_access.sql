-- ============================================================================
-- FIX EVENTS TABLE ACCESS
-- ============================================================================
-- This creates the necessary policies to allow viewing events

-- First, check what policies exist
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'events';

-- If no policies exist, uncomment and run the following:

-- Drop existing events policies if any
DROP POLICY IF EXISTS "All users can view events" ON events;
DROP POLICY IF EXISTS "Anonymous users can view upcoming events" ON events;
DROP POLICY IF EXISTS "Junior officers and VP can create events" ON events;
DROP POLICY IF EXISTS "Users can update events" ON events;
DROP POLICY IF EXISTS "VP can delete events" ON events;

-- Create policies to allow all authenticated users to view events
CREATE POLICY "All users can view events"
ON events FOR SELECT
TO authenticated
USING (true);

-- Allow anonymous users to view upcoming events (for guest applications)
CREATE POLICY "Anonymous users can view upcoming events"
ON events FOR SELECT
TO anon
USING (status = 'upcoming');

-- Junior officers and above can create events
CREATE POLICY "Junior officers and VP can create events"
ON events FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals', 'director_partnerships', 'director_sponsorships')
);

-- Users can update their own events, VP can update all
CREATE POLICY "Users can update events"
ON events FOR UPDATE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals' OR
  created_by = auth.uid()
);

-- VP can delete events
CREATE POLICY "VP can delete events"
ON events FOR DELETE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals'
);
