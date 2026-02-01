-- Check if templates exist and why they're not showing

-- 1. Count all templates (bypassing RLS)
SELECT COUNT(*) as total_templates FROM public.templates;

-- 2. See all templates with details
SELECT 
  id,
  title,
  category,
  external_url,
  created_by,
  created_at
FROM public.templates
ORDER BY created_at DESC;

-- 3. Check what the SELECT policy allows
-- Run this while logged in to see what YOU can see
SELECT * FROM templates;

-- 4. Verify the SELECT policy exists and is correct
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'templates' AND cmd = 'SELECT';

-- 5. Check if there's a created_by issue (invalid user references)
SELECT 
  t.id,
  t.title,
  t.created_by,
  u.email as creator_email,
  CASE 
    WHEN u.id IS NULL THEN 'INVALID - No matching user'
    ELSE 'Valid'
  END as status
FROM public.templates t
LEFT JOIN public.users u ON t.created_by = u.id;

-- ============================================================================
-- FIXES
-- ============================================================================

-- If templates exist but aren't showing, the issue is likely the SELECT policy
-- Let's ensure it's set correctly:

DROP POLICY IF EXISTS "All users can view templates" ON templates;

CREATE POLICY "All users can view templates"
ON templates FOR SELECT
TO authenticated
USING (true);

-- If there are templates with invalid created_by references, fix them:
-- UPDATE public.templates
-- SET created_by = auth.uid()
-- WHERE created_by NOT IN (SELECT id FROM public.users);
