-- Comprehensive fix for event_applications RLS policy
-- This addresses the "new row violates row-level security policy" error

-- Step 1: Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can create event applications" ON public.event_applications;

-- Step 2: Recreate the is_event_upcoming function with proper permissions
-- The issue is that SECURITY DEFINER alone isn't enough - we need to ensure
-- the function owner has the right to query the events table
DROP FUNCTION IF EXISTS public.is_event_upcoming(UUID);

CREATE OR REPLACE FUNCTION public.is_event_upcoming(event_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events
    WHERE id = event_uuid
    AND status = 'upcoming'
  );
$$;

-- Step 3: Grant EXECUTE permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO authenticated;

-- Step 4: Grant table permissions to anon role
GRANT INSERT ON public.event_applications TO anon;

-- Step 5: Recreate the INSERT policy with a simpler approach
-- Instead of relying solely on the function, we'll use a direct subquery
CREATE POLICY "Anyone can create event applications"
  ON public.event_applications FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
      AND events.status = 'upcoming'
    )
  );

-- Step 6: Also allow authenticated users to insert (for testing purposes)
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

-- Step 7: Grant SELECT on events to anon so the policy can check the status
-- This is crucial - the policy needs to be able to read from events table
GRANT SELECT ON public.events TO anon;
