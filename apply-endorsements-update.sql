-- Update endorsements table to use single Google Drive link
-- Run this in Supabase SQL Editor

-- Add new gdrive_link column
ALTER TABLE public.endorsements 
ADD COLUMN IF NOT EXISTS gdrive_link TEXT;

-- Copy existing gdocs_url to gdrive_link (if you have existing data)
UPDATE public.endorsements 
SET gdrive_link = gdocs_url 
WHERE gdrive_link IS NULL AND gdocs_url IS NOT NULL;

-- Drop old columns
ALTER TABLE public.endorsements 
DROP COLUMN IF EXISTS gdocs_url,
DROP COLUMN IF EXISTS gforms_submission_url;

-- Make gdrive_link required
ALTER TABLE public.endorsements 
ALTER COLUMN gdrive_link SET NOT NULL;
