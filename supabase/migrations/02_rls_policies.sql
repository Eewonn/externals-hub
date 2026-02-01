-- ============================================================================
-- RLS POLICIES - Row Level Security configuration
-- ============================================================================
-- Run this after schema creation to set up access control

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Skip: events table RLS already enabled
-- ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
-- Skip: competition_participants table RLS already enabled
-- ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_applications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- GRANT PERMISSIONS TO ROLES
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_event_application(UUID, TEXT, TEXT, TEXT, acm_membership_status, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_application_status(UUID, application_status, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_application_stats() TO authenticated, anon;

-- Grant table permissions for anon users (guest applications)
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.endorsements TO anon;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can insert their own profile during signup
CREATE POLICY "Users can insert their own profile during signup"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can read their own profile
CREATE POLICY "Users can read their own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile (but not their role)
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  role = (SELECT role FROM public.users WHERE id = auth.uid())
);

-- VP Externals and Advisers can view all users
CREATE POLICY "VPs and advisers can view all users"
ON users FOR SELECT
USING (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'adviser')
);

-- VP Externals can create users
CREATE POLICY "VPs can insert users"
ON users FOR INSERT
WITH CHECK (
  public.get_user_role(auth.uid()) = 'vp_externals'
);

-- VP Externals and Advisers can update any user (for approvals and role management)
CREATE POLICY "VPs and advisers can update users"
ON users FOR UPDATE
USING (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'adviser')
);

-- VP Externals can delete users
CREATE POLICY "VPs can delete users"
ON users FOR DELETE
USING (
  public.get_user_role(auth.uid()) = 'vp_externals'
);

-- ============================================================================
-- EVENTS TABLE POLICIES - SKIP (already exist)
-- ============================================================================

-- All authenticated users can view events
-- CREATE POLICY "All users can view events"
-- ON events FOR SELECT
-- TO authenticated
-- USING (true);

-- Anonymous users can view upcoming events (for guest applications)
-- CREATE POLICY "Anonymous users can view upcoming events"
-- ON events FOR SELECT
-- TO anon
-- USING (status = 'upcoming');

-- Junior officers and above can create events
-- CREATE POLICY "Junior officers and VP can create events"
-- ON events FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals', 'director_partnerships', 'director_sponsorships')
-- );

-- Users can update their own events, VP can update all
-- CREATE POLICY "Users can update events"
-- ON events FOR UPDATE
-- TO authenticated
-- USING (
--   public.get_user_role(auth.uid()) = 'vp_externals' OR
--   created_by = auth.uid()
-- );

-- VP can delete events
-- CREATE POLICY "VP can delete events"
-- ON events FOR DELETE
-- TO authenticated
-- USING (
--   public.get_user_role(auth.uid()) = 'vp_externals'
-- );

-- ============================================================================
-- ENDORSEMENTS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view endorsements
CREATE POLICY "All users can view endorsements"
ON endorsements FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can view endorsements for upcoming events
CREATE POLICY "Anonymous users can view endorsements for upcoming events"
ON endorsements FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = endorsements.event_id
    AND events.status = 'upcoming'
  )
);

-- Junior officers and above can create endorsements
CREATE POLICY "Junior officers and VP can create endorsements"
ON endorsements FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals', 'director_partnerships', 'director_sponsorships')
);

-- VP and directors can update endorsements, creators can update drafts
CREATE POLICY "VP and directors can update endorsements"
ON endorsements FOR UPDATE
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships') OR
  (created_by = auth.uid() AND status = 'drafted')
);

-- VP can delete endorsements
CREATE POLICY "VP can delete endorsements"
ON endorsements FOR DELETE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals'
);

-- ============================================================================
-- PARTNERS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view partners
CREATE POLICY "All users can view partners"
ON partners FOR SELECT
TO authenticated
USING (true);

-- Junior officers and above can create partners
CREATE POLICY "Junior officers and VP can create partners"
ON partners FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals', 'director_partnerships', 'director_sponsorships')
);

-- Junior officers, directors, and VP can update partners
CREATE POLICY "Users can update partners"
ON partners FOR UPDATE
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships')
);

-- VP can delete partners
CREATE POLICY "VP can delete partners"
ON partners FOR DELETE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals'
);

-- ============================================================================
-- EMAIL_LOGS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view email logs
CREATE POLICY "All users can view email logs"
ON email_logs FOR SELECT
TO authenticated
USING (true);

-- Junior officers and above can create email logs
CREATE POLICY "Junior officers and VP can create email logs"
ON email_logs FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals', 'director_partnerships', 'director_sponsorships')
);

-- Officers can update their own email logs, VP can update all
CREATE POLICY "Users can update email logs"
ON email_logs FOR UPDATE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals' OR
  officer_in_charge = auth.uid()
);

-- VP can delete email logs
CREATE POLICY "VP can delete email logs"
ON email_logs FOR DELETE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals'
);

-- ============================================================================
-- TASKS TABLE POLICIES
-- ============================================================================

-- Users can view tasks assigned to them or created by them, VP and directors can view all
CREATE POLICY "Users can view relevant tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships') OR
  assigned_to = auth.uid() OR
  created_by = auth.uid()
);

-- Junior officers and above can create tasks
CREATE POLICY "Junior officers and VP can create tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals', 'director_partnerships', 'director_sponsorships')
);

-- Assigned users and creators can update tasks, VP can update all
CREATE POLICY "Users can update tasks"
ON tasks FOR UPDATE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals' OR
  assigned_to = auth.uid() OR
  created_by = auth.uid()
);

-- VP can delete tasks
CREATE POLICY "VP can delete tasks"
ON tasks FOR DELETE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals'
);

-- ============================================================================
-- TEMPLATES TABLE POLICIES
-- ============================================================================

-- All authenticated users can view templates
CREATE POLICY "All users can view templates"
ON templates FOR SELECT
TO authenticated
USING (true);

-- Only VP can create, update, and delete templates
CREATE POLICY "VP can create templates"
ON templates FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role(auth.uid()) = 'vp_externals'
);

CREATE POLICY "VP can update templates"
ON templates FOR UPDATE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals'
);

CREATE POLICY "VP can delete templates"
ON templates FOR DELETE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals'
);

-- ============================================================================
-- COMPETITION_PARTICIPANTS TABLE POLICIES - SKIP (already exist)
-- ============================================================================

-- All authenticated users can view competition participants
-- CREATE POLICY "All users can view competition participants"
-- ON competition_participants FOR SELECT
-- TO authenticated
-- USING (true);

-- Junior officers and above can manage competition participants
-- CREATE POLICY "Junior officers can manage competition participants"
-- ON competition_participants FOR ALL
-- TO authenticated
-- USING (
--   public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals', 'director_partnerships', 'director_sponsorships')
-- );

-- ============================================================================
-- OFFICER_SCHEDULES TABLE POLICIES
-- ============================================================================

-- All users can view schedules
CREATE POLICY "Users can view all officer schedules"
ON officer_schedules FOR SELECT
TO authenticated
USING (true);

-- Users can manage their own schedule, VP can manage all
CREATE POLICY "Users can manage their own schedule"
ON officer_schedules FOR ALL
TO authenticated
USING (
  auth.uid() = user_id OR
  public.get_user_role(auth.uid()) = 'vp_externals'
);

-- ============================================================================
-- SCHEDULE_ENTRIES TABLE POLICIES
-- ============================================================================

-- All users can view schedule entries
CREATE POLICY "Users can view all schedule entries"
ON schedule_entries FOR SELECT
TO authenticated
USING (true);

-- Users can manage their own schedule entries, VP can manage all
CREATE POLICY "Users can manage their own schedule entries"
ON schedule_entries FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM officer_schedules os
    WHERE os.id = schedule_entries.schedule_id
    AND (
      os.user_id = auth.uid() OR
      public.get_user_role(auth.uid()) = 'vp_externals'
    )
  )
);

-- ============================================================================
-- EVENT_APPLICATIONS TABLE POLICIES
-- ============================================================================

-- NOTE: Anon users use the submit_event_application function instead of direct INSERT
-- This bypasses RLS and is more reliable for guest users

-- Authenticated users can view applications for events they manage
CREATE POLICY "Authenticated users can view applications"
ON event_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_applications.event_id
    AND (
      e.created_by = auth.uid() OR
      public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships')
    )
  )
);

-- VP and directors can update applications
CREATE POLICY "VP can update event applications"
ON event_applications FOR UPDATE
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships')
);

-- VP can delete applications
CREATE POLICY "VP can delete event applications"
ON event_applications FOR DELETE
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'vp_externals'
);
