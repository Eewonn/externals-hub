-- Create competition category and nature enums
CREATE TYPE competition_category AS ENUM ('local_regional', 'local_national', 'international');
CREATE TYPE competition_nature AS ENUM ('academic', 'non_academic');

-- Modify events table to include competition-specific fields
ALTER TABLE public.events
ADD COLUMN category competition_category,
ADD COLUMN nature competition_nature,
ADD COLUMN organizer TEXT,
ADD COLUMN rank_award TEXT,
ADD COLUMN group_name TEXT,
ADD COLUMN competition_number INTEGER;

-- Create competition_participants table for detailed participant information
CREATE TABLE public.competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  year_level TEXT NOT NULL,
  course TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for competition participants
CREATE INDEX idx_competition_participants_event_id ON public.competition_participants(event_id);

-- Create trigger for updated_at on competition_participants
CREATE TRIGGER update_competition_participants_updated_at
  BEFORE UPDATE ON public.competition_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update events table constraints to make competition fields nullable for non-competition events
COMMENT ON COLUMN public.events.category IS 'Competition category (only for event_type = competition)';
COMMENT ON COLUMN public.events.nature IS 'Competition nature (only for event_type = competition)';
COMMENT ON COLUMN public.events.organizer IS 'Competition organizer (only for event_type = competition)';
COMMENT ON COLUMN public.events.rank_award IS 'Rank or title of award received (only for event_type = competition)';
COMMENT ON COLUMN public.events.group_name IS 'Team/group name (optional, only for event_type = competition)';
COMMENT ON COLUMN public.events.competition_number IS 'Sequential competition number for tracking';
