-- Check which events have invalid created_by references
SELECT 
  e.id,
  e.title,
  e.created_by,
  CASE 
    WHEN u.id IS NULL THEN 'No matching user'
    ELSE 'User exists'
  END as status
FROM public.events e
LEFT JOIN public.users u ON e.created_by = u.id
WHERE u.id IS NULL;

-- Get your current user ID
SELECT id, email, full_name FROM public.users;

-- Fix: Update all events to be owned by you (your user ID)
-- Replace 'YOUR_USER_ID' with the actual ID from the query above
-- UPDATE public.events
-- SET created_by = 'YOUR_USER_ID'
-- WHERE created_by IS NULL OR created_by NOT IN (SELECT id FROM public.users);
