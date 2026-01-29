-- ============================================================================
-- NUCLEAR OPTION - Disable RLS for INSERT only
-- ============================================================================
-- If all else fails, this completely bypasses RLS for anonymous insertions
-- by creating a public API function that runs with elevated privileges

-- Step 0: Ensure postgres/service role has full access to the table
-- This is needed because SECURITY DEFINER runs as the function owner
GRANT ALL ON public.event_applications TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Step 1: Create a function that inserts with SECURITY DEFINER
-- Set the search_path for security
CREATE OR REPLACE FUNCTION public.submit_event_application(
  p_event_id UUID,
  p_full_name TEXT,
  p_student_number TEXT,
  p_student_email TEXT,
  p_acm_membership_status acm_membership_status,
  p_course_year_level TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application_id UUID;
BEGIN
  -- Check if event is upcoming (this bypasses RLS because of SECURITY DEFINER)
  IF NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE id = p_event_id
    AND status = 'upcoming'
  ) THEN
    RAISE EXCEPTION 'Event is not available for applications';
  END IF;

  -- Insert the application (this also bypasses RLS)
  INSERT INTO public.event_applications (
    event_id,
    full_name,
    student_number,
    student_email,
    acm_membership_status,
    course_year_level
  ) VALUES (
    p_event_id,
    p_full_name,
    p_student_number,
    p_student_email,
    p_acm_membership_status,
    p_course_year_level
  )
  RETURNING id INTO v_application_id;

  -- Add participant to the event's participant_names array
  UPDATE public.events
  SET participant_names = array_append(participant_names, p_full_name)
  WHERE id = p_event_id;

  RETURN v_application_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'You have already applied to this event with this email address';
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.submit_event_application(UUID, TEXT, TEXT, TEXT, acm_membership_status, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_event_application(UUID, TEXT, TEXT, TEXT, acm_membership_status, TEXT) TO authenticated;

-- Step 2: Remove the INSERT policies (we don't need them anymore)
DROP POLICY IF EXISTS "Anon users can create applications for upcoming events" ON public.event_applications;
DROP POLICY IF EXISTS "Authenticated users can create event applications" ON public.event_applications;

-- Step 3: Revoke direct INSERT permission from anon
REVOKE INSERT ON public.event_applications FROM anon;

-- ============================================================================
-- USAGE: Call this function instead of direct INSERT
-- ============================================================================
-- SELECT public.submit_event_application(
--   '9aad35b0-e186-47d2-8419-64b1d1d5dc71',
--   'Test User',
--   '2021-12345',
--   'test@example.com',
--   'no',
--   'BS Computer Science - 3rd Year'
-- );
