-- ============================================================================
-- CLEANUP SCRIPT - Run this FIRST to drop all existing objects
-- ============================================================================
-- WARNING: This will delete most data but preserves events and competition data.
-- Events and competition_participants tables are kept to preserve historical data.

-- Drop all tables (cascade will drop dependent objects)
DROP TABLE IF EXISTS public.event_applications CASCADE;
DROP TABLE IF EXISTS public.schedule_entries CASCADE;
DROP TABLE IF EXISTS public.officer_schedules CASCADE;
-- Keep competition data: DO NOT DROP competition_participants
-- DROP TABLE IF EXISTS public.competition_participants CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.email_logs CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.endorsements CASCADE;
-- Keep event data: DO NOT DROP events table
-- DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.submit_event_application(UUID, TEXT, TEXT, TEXT, acm_membership_status, TEXT);
DROP FUNCTION IF EXISTS public.update_application_status(UUID, application_status, UUID);
DROP FUNCTION IF EXISTS public.get_application_stats();
DROP FUNCTION IF EXISTS public.is_event_upcoming(UUID);
-- Keep function needed by events table RLS policies
-- DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.set_task_completed_at();
-- Keep function needed by events table trigger
-- DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop all custom types
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS acm_membership_status CASCADE;
-- Keep competition types: DO NOT DROP (needed by events table)
-- DROP TYPE IF EXISTS competition_nature CASCADE;
-- DROP TYPE IF EXISTS competition_category CASCADE;
DROP TYPE IF EXISTS template_category CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS email_status CASCADE;
DROP TYPE IF EXISTS relationship_type CASCADE;
DROP TYPE IF EXISTS partner_status CASCADE;
DROP TYPE IF EXISTS endorsement_status CASCADE;
-- Keep event types: DO NOT DROP (needed by events table)
-- DROP TYPE IF EXISTS event_status CASCADE;
-- DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;