-- Create acm_membership_status enum for event applications
CREATE TYPE acm_membership_status AS ENUM ('yes', 'no', 'not_sure');

-- Create event_applications table for guest participant applications
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

-- Create indexes for better query performance
CREATE INDEX idx_event_applications_event_id ON public.event_applications(event_id);
CREATE INDEX idx_event_applications_student_email ON public.event_applications(student_email);
CREATE INDEX idx_event_applications_applied_at ON public.event_applications(applied_at);

-- Create trigger for updated_at on event_applications
CREATE TRIGGER update_event_applications_updated_at
  BEFORE UPDATE ON public.event_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if event is upcoming (with SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_event_upcoming(event_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events
    WHERE id = event_uuid
    AND status = 'upcoming'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Enable RLS on event_applications table
ALTER TABLE public.event_applications ENABLE ROW LEVEL SECURITY;

-- Guest users (unauthenticated) can create applications for upcoming events
CREATE POLICY "Anyone can create event applications"
  ON public.event_applications FOR INSERT
  TO anon
  WITH CHECK (
    public.is_event_upcoming(event_id)
  );

-- Authenticated users (internal staff) can view all applications for their events
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

-- VP Externals can update and delete applications
CREATE POLICY "VP can update event applications"
  ON public.event_applications FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

CREATE POLICY "VP can delete event applications"
  ON public.event_applications FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );
