-- Seed competition data
-- Note: Replace 'SYSTEM_USER_ID' with an actual user ID from your users table

-- Competition 1: Start Up QC
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  -- Get a system user (you'll need to replace this with actual user ID)
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  -- Insert event
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, group_name, competition_number,
    created_by
  ) VALUES (
    'Start Up QC',
    'Asian Innovation Tour of Musashino University (Japan) in collaboration with UP NOVA and Startup QC',
    'competition',
    'UP Diliman',
    '2025-09-02',
    'completed',
    'local_regional',
    'non_academic',
    'Asian Innovation Tour of Musashino University (Japan) in collaboration with UP NOVA and Startup QC.',
    'Second Runner Up',
    'C-Ram Solutions',
    1,
    system_user_id
  ) RETURNING id INTO event_id;
  
  -- Insert participants
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Guennevere C. Rito', '4th', 'BSCSDS'),
    (event_id, 'Jane Cristel A. Bohol', '4th', 'BSCSDS'),
    (event_id, 'Myles Nadine DG. Manalastas', '4th', 'BSCSDS'),
    (event_id, 'Shann Karl Felipe', '3rd', 'BSCSSE'),
    (event_id, 'Marc Lester J. Sumague', '4th', 'BSCSDS');
END $$;

-- Competition 2: 2025 STARTUP MUNTINLUPA
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, group_name, competition_number,
    created_by
  ) VALUES (
    '2025 STARTUP MUNTINLUPA',
    'Local Economic and Investment Promotion Office (LEIPO) of the City Government of Muntinlupa',
    'competition',
    'UP Diliman',
    '2025-10-29',
    'completed',
    'local_regional',
    'non_academic',
    'Local Economic and Investment Promotion Office (LEIPO) of the City Government of Muntinlupa.',
    'None',
    'NERDS 2.0',
    2,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Eimerl Landhy Collantes', '3rd', 'BSCSSE'),
    (event_id, 'Althea Louise Cheng', '3rd', 'BSCSSE'),
    (event_id, 'Shann Karl Felipe', '3rd', 'BSCSSE'),
    (event_id, 'Marc Lester Sumague', '4th', 'BSCSDS'),
    (event_id, 'Matthew Rhomar Santos', '3rd', 'BSCSSE');
END $$;

-- Competition 3: Space Business Innovation Challenge 2025
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, competition_number,
    created_by
  ) VALUES (
    'Space Business Innovation Challenge 2025',
    'Philippine Space Agency innovation challenge',
    'competition',
    'UP Diliman',
    '2025-11-08',
    'completed',
    'local_national',
    'non_academic',
    'Philippine Space Agency',
    'None',
    3,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Amiel Josiah C. Acuña', '3rd', 'BSCSSE'),
    (event_id, 'Jhezra A. Tolentino', '3rd', 'BSCSSE'),
    (event_id, 'Marcus Ceasar Q. Austria', '3rd', 'BSCSSE'),
    (event_id, 'Ric Ian I. Barrios', '3rd', 'BSCSSE');
END $$;

-- Competition 4: NextGenPH Youth Innovators
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, competition_number,
    created_by
  ) VALUES (
    'NextGenPH Youth Innovators Reimagining Public Service',
    'Development Academy of the Philippines youth innovation program',
    'competition',
    'UP Diliman',
    '2025-10-31',
    'completed',
    'local_national',
    'non_academic',
    'Development Academy of the Philippines',
    'None',
    3,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Amiel Josiah C. Acuña', '3rd', 'BSCSSE'),
    (event_id, 'Jhezra A. Tolentino', '3rd', 'BSCSSE'),
    (event_id, 'Paul Henry M. Dacalan', '3rd', 'BSCSSE'),
    (event_id, 'Marcus Ceasar Q. Austria', '3rd', 'BSCSSE'),
    (event_id, 'Ric Ian I. Barrios', '3rd', 'BSCSSE');
END $$;

-- Competition 5: BPI D.A.T.A. Wave Hackathon
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, competition_number,
    created_by
  ) VALUES (
    'BPI D.A.T.A. Wave Hackathon & Summit 2025 - Digitalization Track',
    'Bank of the Philippine Islands and Eskwelabs hackathon competition',
    'competition',
    'UP Diliman',
    '2025-10-01',
    'completed',
    'local_national',
    'academic',
    'Bank of the Philippine Islands (BPI) and Eskwelabs',
    'Champion',
    4,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Jansen Moral', '4th', 'BSCSSE'),
    (event_id, 'Cristen Tolentino', '4th', 'BSCpE');
END $$;

-- Competition 6: DICT Philippine Startup Challenge X (NCR) - Champion
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, group_name, competition_number,
    created_by
  ) VALUES (
    'DICT Philippine Startup Challenge X (NCR)',
    'Department of Information and Communications Technology startup competition',
    'competition',
    'UP Diliman',
    '2025-10-29',
    'completed',
    'local_regional',
    'academic',
    'Department of Information and Communications Technology of the Philippines',
    'Champion',
    'TrashScan',
    5,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Jansen Jhoel Moral', '4th', 'BSCSSE'),
    (event_id, 'John Christian Paglinawan', '4th', 'BSCSSE'),
    (event_id, 'Dane Ross Quintano', '4th', 'BSCSSE'),
    (event_id, 'Dharmveer Sandhu', '4th', 'BSCSSE');
END $$;

-- Competition 7: DICT Philippine Startup Challenge X (NCR) - Best Logo
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, group_name, competition_number,
    created_by
  ) VALUES (
    'DICT Philippine Startup Challenge X (NCR) - Best Logo',
    'Department of Information and Communications Technology startup competition - Logo Award',
    'competition',
    'UP Diliman',
    '2025-10-29',
    'completed',
    'local_regional',
    'non_academic',
    'Department of Information and Communications Technology of the Philippines',
    'Best Logo',
    'TrashScan',
    6,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Jansen Jhoel Moral', '4th', 'BSCSSE'),
    (event_id, 'John Christian Paglinawan', '4th', 'BSCSSE'),
    (event_id, 'Dane Ross Quintano', '4th', 'BSCSSE'),
    (event_id, 'Dharmveer Sandhu', '4th', 'BSCSSE');
END $$;

-- Competition 8: DICT Philippine Startup Challenge X (NCR) - First Runner Up
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, group_name, competition_number,
    created_by
  ) VALUES (
    'DICT Philippine Startup Challenge X (NCR) - Gabaydiwa',
    'Department of Information and Communications Technology startup competition',
    'competition',
    'UP Diliman',
    '2025-10-29',
    'completed',
    'local_regional',
    'academic',
    'Department of Information and Communications Technology of the Philippines',
    'First Runner Up',
    'Gabaydiwa',
    7,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Shann Karl Felipe', '3rd', 'BSCSSE'),
    (event_id, 'Althea Cheng', '3rd', 'BSCSSE'),
    (event_id, 'Eimerl Collantes', '3rd', 'BSCSSE'),
    (event_id, 'Matthew Rhomar Santos', '3rd', 'BSCSSE');
END $$;

-- Competition 9: 14th IT Olympics - Database Programming
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, competition_number,
    created_by
  ) VALUES (
    '14th IT Olympics - Database Programming',
    'University of Makati IT Olympics database programming competition',
    'competition',
    'UP Diliman',
    '2025-11-21',
    'completed',
    'local_national',
    'academic',
    'University of Makati - College of Computing & Information Sciences',
    'First Runner Up',
    8,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Mikhael Edmar P. Gomez', '3rd', 'BSCSSE'),
    (event_id, 'Teodorico P. Carpio Jr.', '3rd', 'BSIT');
END $$;

-- Competition 10: 14th IT Olympics - I.T. Quiz Bee
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, competition_number,
    created_by
  ) VALUES (
    '14th IT Olympics - I.T. Quiz Bee',
    'University of Makati IT Olympics quiz bee competition',
    'competition',
    'UP Diliman',
    '2025-11-21',
    'completed',
    'local_national',
    'academic',
    'University of Makati - College of Computing & Information Sciences',
    'Second Runner Up',
    8,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Raphael V. Paraqua', '4th', 'BSCSSE'),
    (event_id, 'Dane Ross B. Quintano', '4th', 'BSCSSE');
END $$;

-- Competition 11: READERS RISING! Hackathon 2025
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, group_name, competition_number,
    created_by
  ) VALUES (
    'READERS RISING! Hackathon 2025',
    'National Book Development Board hackathon promoting reading culture',
    'competition',
    'UP Diliman',
    '2025-09-13',
    'completed',
    'local_regional',
    'academic',
    'National Book Development Board - Philippines',
    'First Runner Up',
    'Nerds 2.0',
    9,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Shann Karl Felipe', '3rd', 'BSCSSE'),
    (event_id, 'Althea Cheng', '3rd', 'BSCSSE'),
    (event_id, 'Eimerl Collantes', '3rd', 'BSCSSE'),
    (event_id, 'Matthew Rhomar Santos', '3rd', 'BSCSSE');
END $$;

-- Competition 12: Smart City Design Challenge - Top 11
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, group_name, competition_number,
    created_by
  ) VALUES (
    'Smart City Design Challenge',
    'DOST-NCR smart city innovation challenge',
    'competition',
    'UP Diliman',
    '2025-11-17',
    'completed',
    'local_regional',
    'academic',
    'Department of Science and Technology - National Capital Region',
    'Top 11 - Finalist',
    'Agile',
    10,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Jansen Jhoel Moral', '4th', 'BSCSSE'),
    (event_id, 'Dane Ross Quintano', '4th', 'BSCSSE'),
    (event_id, 'John Christian Paglinawan', '4th', 'BSCSSE'),
    (event_id, 'Dharmveer Sandhu', '4th', 'BSCSSE'),
    (event_id, 'Cristen Lei Tolentino', '4th', 'BSCpE');
END $$;

-- Competition 13: Smart City Design Challenge - Most Innovative
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, group_name, competition_number,
    created_by
  ) VALUES (
    'Smart City Design Challenge - Most Innovative Project',
    'DOST-NCR smart city innovation challenge special award',
    'competition',
    'UP Diliman',
    '2025-11-17',
    'completed',
    'local_regional',
    'academic',
    'Department of Science and Technology - National Capital Region',
    'Most Innovative Project',
    'Agile',
    11,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Jansen Jhoel Moral', '4th', 'BSCSSE'),
    (event_id, 'Dane Ross Quintano', '4th', 'BSCSSE'),
    (event_id, 'John Christian Paglinawan', '4th', 'BSCSSE'),
    (event_id, 'Dharmveer Sandhu', '4th', 'BSCSSE'),
    (event_id, 'Cristen Lei Tolentino', '4th', 'BSCpE');
END $$;

-- Competition 14: DICT Philippine Startup Challenge X (Nationals)
DO $$
DECLARE
  event_id UUID;
  system_user_id UUID;
BEGIN
  SELECT id INTO system_user_id FROM public.users WHERE role = 'vp_externals' LIMIT 1;
  
  INSERT INTO public.events (
    title, description, event_type, school_associate, event_date, status,
    category, nature, organizer, rank_award, group_name, competition_number,
    created_by
  ) VALUES (
    'DICT Philippine Startup Challenge X (Nationals)',
    'DOST National startup challenge finals',
    'competition',
    'UP Diliman',
    '2025-12-04',
    'completed',
    'local_national',
    'non_academic',
    'Department of Science and Technology - Nationals',
    'People''s Choice Award',
    'Agile',
    12,
    system_user_id
  ) RETURNING id INTO event_id;
  
  INSERT INTO public.competition_participants (event_id, student_name, year_level, course) VALUES
    (event_id, 'Jansen Jhoel Moral', '4th', 'BSCSSE'),
    (event_id, 'Dane Ross Quintano', '4th', 'BSCSSE'),
    (event_id, 'Dharmveer Sandhu', '4th', 'BSCSSE');
END $$;
