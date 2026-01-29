-- Add application status and approval system to event_applications

-- Step 1: Create application_status enum
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- Step 2: Add status column to event_applications table
ALTER TABLE public.event_applications
ADD COLUMN status application_status NOT NULL DEFAULT 'pending',
ADD COLUMN reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN reviewed_at TIMESTAMPTZ;

-- Step 3: Create index on status for better query performance
CREATE INDEX idx_event_applications_status ON public.event_applications(status);

-- Step 4: Create function to approve/reject applications
CREATE OR REPLACE FUNCTION public.update_application_status(
  p_application_id UUID,
  p_status application_status,
  p_reviewer_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if reviewer has permission (VP or directors)
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = p_reviewer_id
    AND role IN ('vp_externals', 'director_partnerships', 'director_sponsorships')
  ) THEN
    RAISE EXCEPTION 'User does not have permission to review applications';
  END IF;

  -- Update the application status
  UPDATE public.event_applications
  SET 
    status = p_status,
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW()
  WHERE id = p_application_id;

  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_application_status(UUID, application_status, UUID) TO authenticated;

-- Step 5: Create function to get application statistics
CREATE OR REPLACE FUNCTION public.get_application_stats()
RETURNS TABLE (
  total_applications BIGINT,
  pending_applications BIGINT,
  approved_applications BIGINT,
  rejected_applications BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_applications,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications
  FROM public.event_applications;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_application_stats() TO authenticated;
