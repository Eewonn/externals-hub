-- Fix RLS policy for event_applications to allow anonymous insertions
-- This migration addresses the "new row violates row-level security policy" error

-- Grant EXECUTE permission on is_event_upcoming function to anon role
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO anon;

-- Optionally, we can also simplify the RLS policy by checking the event status directly
-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can create event applications" ON public.event_applications;

-- Recreate with a more explicit check that works with the anon role
CREATE POLICY "Anyone can create event applications"
  ON public.event_applications FOR INSERT
  TO anon
  WITH CHECK (
    -- Check if the event exists and is upcoming
    -- This uses the SECURITY DEFINER function which can bypass RLS on events table
    public.is_event_upcoming(event_id)
  );

-- Ensure the anon role can use the table
GRANT INSERT ON public.event_applications TO anon;
