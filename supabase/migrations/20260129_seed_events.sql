-- Seed event data
-- Note: This will use the first vp_externals user as the creator

-- Event 1: 23rd MAP International CEO Conference
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    organizer, created_by
  ) VALUES (
    '23rd MAP International CEO Conference',
    'Management Association of the Philippines annual CEO conference',
    'event',
    'UP Diliman',
    '2025-09-09',
    'completed',
    'Management Association of the Philippines',
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Janelle Facto', '3rd', 'BSCSSE');
END $$;

-- Event 2: Internet of Things Conference Philippines 2025
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    organizer, created_by
  ) VALUES (
    'Internet of Things Conference Philippines 2025',
    'Packetworx and Redwizard IoT Conference',
    'event',
    'UP Diliman',
    '2025-09-10',
    'completed',
    'Packetworx and Redwizard',
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Grant Gabriell R. Ostol', '3rd', 'BSCSSE'),
    (event_id, 'Coleen Raye C. Magbag', '3rd', 'BSCSSE'),
    (event_id, 'Shana Anikka N. Patio', '3rd', 'BSCSSE'),
    (event_id, 'Mark Eron A. Diaz', '3rd', 'BSCSSE'),
    (event_id, 'Aaron Gabriel B. Claro', '2nd', 'BSCSDS'),
    (event_id, 'Kristine Marie P. Ibasco', '2nd', 'BSCSDS');
END $$;

-- Event 3: Software Freedom Day 2025
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    organizer, created_by
  ) VALUES (
    'Software Freedom Day 2025 - Tara Mag Open Source Tayo',
    'WordPress User Group Philippines open source celebration event',
    'event',
    'UP Diliman',
    '2025-09-20',
    'completed',
    'WordPress User Group Philippines',
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Xynil Jhed Lacap', '4th', 'BSCSSE');
END $$;
