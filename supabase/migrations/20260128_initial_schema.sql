-- Create custom types (enums)
CREATE TYPE user_role AS ENUM (
  'vp_externals',
  'junior_officer',
  'director_partnerships',
  'director_sponsorships',
  'adviser'
);

CREATE TYPE event_type AS ENUM ('competition', 'event');

CREATE TYPE event_status AS ENUM (
  'upcoming',
  'ongoing',
  'completed',
  'cancelled'
);

CREATE TYPE endorsement_status AS ENUM (
  'drafted',
  'vpe_reviewed',
  'submitted_to_sado',
  'approved',
  'rejected'
);

CREATE TYPE partner_status AS ENUM (
  'potential',
  'contacted',
  'ongoing_coordination',
  'active_partner',
  'inactive'
);

CREATE TYPE relationship_type AS ENUM ('partner', 'sponsor');

CREATE TYPE email_status AS ENUM ('sent', 'replied', 'no_response');

CREATE TYPE task_status AS ENUM ('pending', 'ongoing', 'completed', 'blocked');

CREATE TYPE template_category AS ENUM (
  'email',
  'endorsement',
  'apf',
  'app',
  'post_event_report',
  'other'
);

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'junior_officer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type event_type NOT NULL,
  school_associate TEXT NOT NULL,
  participant_names TEXT[] NOT NULL DEFAULT '{}',
  participant_count INTEGER GENERATED ALWAYS AS (array_length(participant_names, 1)) STORED,
  event_date DATE NOT NULL,
  status event_status NOT NULL DEFAULT 'upcoming',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create endorsements table
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

-- Create partners table
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

-- Create email_logs table
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

-- Create tasks table
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

-- Create templates table
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

-- Create indexes for better query performance
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_event_date ON public.events(event_date);

CREATE INDEX idx_endorsements_event_id ON public.endorsements(event_id);
CREATE INDEX idx_endorsements_status ON public.endorsements(status);
CREATE INDEX idx_endorsements_created_by ON public.endorsements(created_by);

CREATE INDEX idx_partners_status ON public.partners(status);
CREATE INDEX idx_partners_relationship_type ON public.partners(relationship_type);
CREATE INDEX idx_partners_created_by ON public.partners(created_by);

CREATE INDEX idx_email_logs_partner_id ON public.email_logs(partner_id);
CREATE INDEX idx_email_logs_officer_in_charge ON public.email_logs(officer_in_charge);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);

CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX idx_tasks_partner_id ON public.tasks(partner_id);

CREATE INDEX idx_templates_category ON public.templates(category);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

-- Create function to automatically set completed_at when task status changes to completed
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

CREATE TRIGGER task_completed_trigger
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_task_completed_at();
