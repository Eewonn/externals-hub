-- ULTIMATE FIX: Bypass RLS on events table for the policy check
-- The issue is that even with GRANT SELECT, the RLS policies on events table
-- are blocking the anon role from reading it in the WITH CHECK clause

-- Step 1: Modify the is_event_upcoming function to ensure it bypasses RLS
DROP FUNCTION IF EXISTS public.is_event_upcoming(UUID);

CREATE OR REPLACE FUNCTION public.is_event_upcoming(event_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the owner
STABLE
AS $$
BEGIN
  -- This function will bypass RLS because of SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 FROM public.events
    WHERE id = event_uuid
    AND status = 'upcoming'
  );
END;
$$;

-- Grant execute to everyone
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO public;

-- Step 2: Drop all existing INSERT policies on event_applications
DROP POLICY IF EXISTS "Anyone can create event applications" ON public.event_applications;
DROP POLICY IF EXISTS "Anon users can create applications for upcoming events" ON public.event_applications;
DROP POLICY IF EXISTS "Authenticated users can create event applications" ON public.event_applications;

-- Step 3: Create the INSERT policy using ONLY the function (no direct table access)
CREATE POLICY "Anon users can create applications for upcoming events"
  ON public.event_applications FOR INSERT
  TO anon
  WITH CHECK (
    -- Use ONLY the SECURITY DEFINER function, not a direct subquery
    public.is_event_upcoming(event_id) = true
  );

-- Step 4: Create policy for authenticated users
CREATE POLICY "Authenticated users can create event applications"
  ON public.event_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_event_upcoming(event_id) = true
  );

-- Step 5: Grant INSERT permission on event_applications
GRANT INSERT ON public.event_applications TO anon;
GRANT INSERT ON public.event_applications TO authenticated;

-- Step 6: Ensure anon can use the default value function for UUID
GRANT EXECUTE ON FUNCTION gen_random_uuid() TO anon;
GRANT EXECUTE ON FUNCTION gen_random_uuid() TO authenticated;
