-- Allow anonymous (guest) users to view events for the application portal
-- This is necessary for the /apply page to show available events
CREATE POLICY "Anonymous users can view upcoming events"
  ON public.events FOR SELECT
  TO anon
  USING (status = 'upcoming');

-- Also allow anonymous users to view endorsements (needed for filtering)
-- Only for events that are upcoming
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
