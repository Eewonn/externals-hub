-- Templates exist! Let's verify the category values are correct

-- Check what categories your templates have
SELECT 
  id,
  title,
  category,
  external_url
FROM public.templates;

-- Check what the enum allows
SELECT 
  enumlabel as allowed_category
FROM pg_enum
WHERE enumtypid = 'template_category'::regtype
ORDER BY enumsortorder;

-- If categories don't match the enum, you'll see an error
-- Valid categories should be: email, endorsement, form, report, app (lowercase)

-- Fix if needed (check output first):
-- UPDATE public.templates SET category = 'app' WHERE category = 'APP';
