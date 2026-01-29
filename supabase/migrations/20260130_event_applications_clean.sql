-- ============================================================================
-- EVENT APPLICATIONS FEATURE - CLEAN IMPLEMENTATION
-- ============================================================================
-- This migration creates the event applications feature for guest users
-- to apply to upcoming events through the /apply portal

-- Step 1: Create enum for ACM membership status
CREATE TYPE acm_membership_status AS ENUM ('yes', 'no', 'not_sure');

-- Step 2: Create event_applications table
CREATE TABLE public.event_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  student_number TEXT NOT NULL,
  student_email TEXT NOT NULL,
  acm_membership_status acm_membership_status NOT NULL,
  course_year_level TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure each student can only apply once per event
  CONSTRAINT unique_student_per_event UNIQUE(event_id, student_email)
);

-- Step 3: Create indexes for better query performance
CREATE INDEX idx_event_applications_event_id ON public.event_applications(event_id);
CREATE INDEX idx_event_applications_student_email ON public.event_applications(student_email);
CREATE INDEX idx_event_applications_applied_at ON public.event_applications(applied_at);

-- Step 4: Create trigger for updated_at
CREATE TRIGGER update_event_applications_updated_at
  BEFORE UPDATE ON public.event_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Create helper function to check if event is upcoming
-- This function uses SECURITY DEFINER to bypass RLS on the events table
CREATE OR REPLACE FUNCTION public.is_event_upcoming(event_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- This function bypasses RLS because of SECURITY DEFINER
  -- It runs with the privileges of the function owner (postgres/service role)
  RETURN EXISTS (
    SELECT 1 FROM public.events
    WHERE id = event_uuid
    AND status = 'upcoming'
  );
END;
$$;

-- Grant execute permission on the function to all roles
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO public;

-- Step 6: Enable RLS on event_applications table
ALTER TABLE public.event_applications ENABLE ROW LEVEL SECURITY;

-- Step 7: Grant necessary table permissions to anon role
GRANT INSERT ON public.event_applications TO anon;
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.endorsements TO anon;

-- Step 8: Create RLS policies for event_applications

-- Policy 1: Anonymous users can create applications for upcoming events
CREATE POLICY "Anon users can create applications for upcoming events"
  ON public.event_applications FOR INSERT
  TO anon
  WITH CHECK (
    -- Use the SECURITY DEFINER function to check if event is upcoming
    -- This bypasses RLS on the events table
    public.is_event_upcoming(event_id) = true
  );

-- Policy 2: Authenticated users can also create applications
CREATE POLICY "Authenticated users can create event applications"
  ON public.event_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_event_upcoming(event_id) = true
  );

-- Policy 3: Authenticated users can view applications for their events
CREATE POLICY "Authenticated users can view applications for their events"
  ON public.event_applications FOR SELECT
  TO authenticated
  USING (
    -- Users can view applications for events they created or manage
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_applications.event_id
      AND (
        e.created_by = auth.uid() OR
        public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships')
      )
    )
  );

-- Policy 4: VP Externals can update applications
CREATE POLICY "VP can update event applications"
  ON public.event_applications FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

-- Policy 5: VP Externals can delete applications
CREATE POLICY "VP can delete event applications"
  ON public.event_applications FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

-- Step 9: Create RLS policies for anon access to events and endorsements

-- Allow anonymous users to view upcoming events (needed for /apply page)
CREATE POLICY "Anonymous users can view upcoming events"
  ON public.events FOR SELECT
  TO anon
  USING (status = 'upcoming');

-- Allow anonymous users to view endorsements for upcoming events
CREATE POLICY "Anonymous users can view endorsements for upcoming events"
  ON public.endorsements FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = endorsements.event_id
      AND events.status = 'upcoming'
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES (Optional - run these to verify the setup)
-- ============================================================================

-- Check that the table was created
-- SELECT * FROM public.event_applications LIMIT 1;

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'event_applications';

-- Test the is_event_upcoming function (replace with actual event ID)
-- SELECT public.is_event_upcoming('your-event-id-here');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
