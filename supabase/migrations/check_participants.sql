-- Check if participants are being added to the events table
-- Replace 'your-event-id' with the actual event ID you're testing with

-- 1. Check the event's participant_names array
SELECT id, title, participant_names, participant_count
FROM public.events
WHERE title = 'Test Event';

-- 2. Check if applications exist in event_applications table
SELECT 
  ea.id,
  ea.event_id,
  ea.full_name,
  ea.student_email,
  ea.applied_at,
  e.title as event_title
FROM public.event_applications ea
JOIN public.events e ON e.id = ea.event_id
WHERE e.title = 'Test Event'
ORDER BY ea.applied_at DESC;

-- 3. If participant_names is empty but applications exist, manually update
-- (This is a one-time fix if the function wasn't working before)
UPDATE public.events
SET participant_names = (
  SELECT array_agg(full_name)
  FROM public.event_applications
  WHERE event_id = events.id
)
WHERE title = 'Test Event';
