-- ============================================================================
-- SCHEMA MIGRATION - Core tables and types
-- ============================================================================
-- Run this after cleanup to create fresh database schema

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Create types only if they don't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
      'vp_externals',
      'junior_officer',
      'director_partnerships',
      'director_sponsorships',
      'adviser'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Skip event_type - already exists
-- DO $$ BEGIN
--     CREATE TYPE event_type AS ENUM ('competition', 'event');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- Skip event_status - already exists
-- DO $$ BEGIN
--     CREATE TYPE event_status AS ENUM (
--       'upcoming',
--       'ongoing',
--       'completed',
--       'cancelled'
--     );
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

DO $$ BEGIN
    CREATE TYPE endorsement_status AS ENUM (
      'drafted',
      'vpe_reviewed',
      'submitted_to_sado',
      'approved',
      'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE partner_status AS ENUM (
      'potential',
      'contacted',
      'ongoing_coordination',
      'active_partner',
      'inactive'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE relationship_type AS ENUM ('partner', 'sponsor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE email_status AS ENUM ('sent', 'replied', 'no_response');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('pending', 'ongoing', 'completed', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE template_category AS ENUM (
      'email',
      'endorsement',
      'apf',
      'app',
      'post_event_report',
      'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Skip competition_category - already exists
-- DO $$ BEGIN
--     CREATE TYPE competition_category AS ENUM ('local_regional', 'local_national', 'international');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- Skip competition_nature - already exists
-- DO $$ BEGIN
--     CREATE TYPE competition_nature AS ENUM ('academic', 'non_academic');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

DO $$ BEGIN
    CREATE TYPE acm_membership_status AS ENUM ('yes', 'no', 'not_sure');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'junior_officer',
  approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events table - SKIP (already exists with data)
-- CREATE TABLE public.events (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   title TEXT NOT NULL,
--   description TEXT NOT NULL,
--   event_type event_type NOT NULL,
--   school_associate TEXT NOT NULL,
--   participant_names TEXT[] NOT NULL DEFAULT '{}',
--   participant_count INTEGER GENERATED ALWAYS AS (array_length(participant_names, 1)) STORED,
--   event_date DATE NOT NULL,
--   status event_status NOT NULL DEFAULT 'upcoming',
--   -- Competition-specific fields (nullable for regular events)
--   category competition_category,
--   nature competition_nature,
--   organizer TEXT,
--   rank_award TEXT,
--   group_name TEXT,
--   competition_number INTEGER,
--   created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- Endorsements table
CREATE TABLE public.endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  gdocs_url TEXT NOT NULL,
  gforms_submission_url TEXT,
  status endorsement_status NOT NULL DEFAULT 'drafted',
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partners table
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status partner_status NOT NULL DEFAULT 'potential',
  relationship_type relationship_type NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email logs table
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  officer_in_charge UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status email_status NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  deadline DATE NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT task_reference_check CHECK (
    (event_id IS NOT NULL AND partner_id IS NULL) OR
    (event_id IS NULL AND partner_id IS NOT NULL) OR
    (event_id IS NULL AND partner_id IS NULL)
  )
);

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category template_category NOT NULL,
  external_url TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competition participants table - SKIP (already exists with data)
-- CREATE TABLE public.competition_participants (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
--   student_name TEXT NOT NULL,
--   year_level TEXT NOT NULL,
--   course TEXT NOT NULL,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- Officer schedules table
CREATE TABLE public.officer_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schedule entries table
CREATE TABLE public.schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES officer_schedules(id) ON DELETE CASCADE NOT NULL,
  course_code VARCHAR(50) NOT NULL,
  course_title TEXT NOT NULL,
  section VARCHAR(20) NOT NULL,
  units INTEGER NOT NULL,
  days TEXT[] NOT NULL,
  time_ranges TEXT[] NOT NULL,
  rooms TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event applications table (for guest applications)
CREATE TABLE public.event_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  student_number TEXT NOT NULL,
  student_email TEXT NOT NULL,
  acm_membership_status acm_membership_status NOT NULL,
  course_year_level TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_student_per_event UNIQUE(event_id, student_email)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_approval_status ON public.users(approval_status);

-- Events indexes - SKIP (already exist)
-- CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
-- CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
-- CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
-- CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);

-- Endorsements indexes
CREATE INDEX idx_endorsements_event_id ON public.endorsements(event_id);
CREATE INDEX idx_endorsements_status ON public.endorsements(status);
CREATE INDEX idx_endorsements_created_by ON public.endorsements(created_by);

-- Partners indexes
CREATE INDEX idx_partners_status ON public.partners(status);
CREATE INDEX idx_partners_relationship_type ON public.partners(relationship_type);
CREATE INDEX idx_partners_created_by ON public.partners(created_by);

-- Email logs indexes
CREATE INDEX idx_email_logs_partner_id ON public.email_logs(partner_id);
CREATE INDEX idx_email_logs_officer_in_charge ON public.email_logs(officer_in_charge);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);

-- Tasks indexes
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX idx_tasks_partner_id ON public.tasks(partner_id);

-- Templates indexes
CREATE INDEX idx_templates_category ON public.templates(category);

-- Competition participants indexes - SKIP (already exist)
-- CREATE INDEX IF NOT EXISTS idx_competition_participants_event_id ON public.competition_participants(event_id);

-- Officer schedules indexes
CREATE INDEX idx_officer_schedules_user_id ON public.officer_schedules(user_id);
CREATE INDEX idx_schedule_entries_schedule_id ON public.schedule_entries(schedule_id);

-- Event applications indexes
CREATE INDEX idx_event_applications_event_id ON public.event_applications(event_id);
CREATE INDEX idx_event_applications_student_email ON public.event_applications(student_email);
CREATE INDEX idx_event_applications_applied_at ON public.event_applications(applied_at);
CREATE INDEX idx_event_applications_status ON public.event_applications(status);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set completed_at when task status changes to completed
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get user role (used in RLS policies)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to check if event is upcoming (for guest applications)
CREATE OR REPLACE FUNCTION public.is_event_upcoming(event_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.events
    WHERE id = event_uuid
    AND status = 'upcoming'
  );
END;
$$;

-- Function to submit event application (bypasses RLS for anon users)
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
  -- Check if event is upcoming
  IF NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE id = p_event_id
    AND status = 'upcoming'
  ) THEN
    RAISE EXCEPTION 'Event is not available for applications';
  END IF;

  -- Insert the application
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

-- Function to update application status (approve/reject)
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
  -- Check if reviewer has permission
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

-- Function to get application statistics
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

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Skip trigger for events table - already exists
-- CREATE TRIGGER update_events_updated_at
--   BEFORE UPDATE ON public.events
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_endorsements_updated_at
  BEFORE UPDATE ON public.endorsements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Skip trigger for competition_participants - already exists
-- CREATE TRIGGER update_competition_participants_updated_at
--   BEFORE UPDATE ON public.competition_participants
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_officer_schedules_updated_at
  BEFORE UPDATE ON public.officer_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_entries_updated_at
  BEFORE UPDATE ON public.schedule_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_applications_updated_at
  BEFORE UPDATE ON public.event_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Task completed_at trigger
CREATE TRIGGER task_completed_trigger
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_task_completed_at();
