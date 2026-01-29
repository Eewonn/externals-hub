-- ============================================================================
-- CLEANUP SCRIPT - Run this BEFORE applying the clean migration
-- ============================================================================
-- This script removes all the previous attempts and resets the event_applications feature

-- Step 1: Drop all existing policies on event_applications (if table exists)
DROP POLICY IF EXISTS "Anyone can create event applications" ON public.event_applications;
DROP POLICY IF EXISTS "Anon users can create applications for upcoming events" ON public.event_applications;
DROP POLICY IF EXISTS "Authenticated users can create event applications" ON public.event_applications;
DROP POLICY IF EXISTS "Authenticated users can view applications for their events" ON public.event_applications;
DROP POLICY IF EXISTS "VP can update event applications" ON public.event_applications;
DROP POLICY IF EXISTS "VP can delete event applications" ON public.event_applications;

-- Step 2: Drop policies on events and endorsements for anon access
DROP POLICY IF EXISTS "Anonymous users can view upcoming events" ON public.events;
DROP POLICY IF EXISTS "Anonymous users can view endorsements for upcoming events" ON public.endorsements;

-- Step 3: Revoke grants from anon role
REVOKE ALL ON public.event_applications FROM anon;
REVOKE SELECT ON public.events FROM anon;
REVOKE SELECT ON public.endorsements FROM anon;

-- Step 4: Drop the helper function
DROP FUNCTION IF EXISTS public.is_event_upcoming(UUID);

-- Step 5: Drop the event_applications table (this will cascade and remove all data)
DROP TABLE IF EXISTS public.event_applications CASCADE;

-- Step 6: Drop the enum type
DROP TYPE IF EXISTS acm_membership_status;

-- ============================================================================
-- After running this cleanup script, run the clean migration:
-- 20260130_event_applications_clean.sql
-- ============================================================================
