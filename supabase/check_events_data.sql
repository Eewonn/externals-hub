-- Check events and their created_by values
SELECT 
  id,
  title,
  event_type,
  status,
  created_by,
  event_date
FROM public.events
ORDER BY event_date DESC
LIMIT 10;

-- Check if created_by users exist in users table
SELECT 
  e.id as event_id,
  e.title,
  e.created_by,
  u.full_name,
  u.id as user_exists
FROM public.events e
LEFT JOIN public.users u ON e.created_by = u.id
LIMIT 10;

-- Count events
SELECT COUNT(*) as total_events FROM public.events;
