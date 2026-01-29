-- FINAL FIX for event_applications RLS policy
-- This addresses all permission issues for anonymous users

-- Step 1: Grant necessary SELECT permissions to anon role
-- The anon role needs to read from events and endorsements tables for the policy to work
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.endorsements TO anon;

-- Step 2: Grant INSERT permission on event_applications to anon
GRANT INSERT ON public.event_applications TO anon;

-- Step 3: Drop ALL existing INSERT policies on event_applications
DROP POLICY IF EXISTS "Anyone can create event applications" ON public.event_applications;
DROP POLICY IF EXISTS "Authenticated users can create event applications" ON public.event_applications;

-- Step 4: Create a single, comprehensive INSERT policy for anon users
-- This checks if the event is upcoming (simplified approach)
CREATE POLICY "Anon users can create applications for upcoming events"
  ON public.event_applications FOR INSERT
  TO anon
  WITH CHECK (
    -- Simply check if the event exists and is upcoming
    -- No need to check endorsement status for guest applications
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
      AND events.status = 'upcoming'
    )
  );

-- Step 5: Create INSERT policy for authenticated users
CREATE POLICY "Authenticated users can create event applications"
  ON public.event_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
      AND events.status = 'upcoming'
    )
  );

-- Step 6: Verify the function has proper permissions (if it exists)
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO authenticated;
