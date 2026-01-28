-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- USERS TABLE POLICIES
-- VP Externals can view and manage all users
CREATE POLICY "VP Externals can view all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

CREATE POLICY "VP Externals can insert users"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

CREATE POLICY "VP Externals can update users"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- EVENTS TABLE POLICIES
-- All authenticated users can view events
CREATE POLICY "All users can view events"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

-- Junior officers and VP can create events
CREATE POLICY "Junior officers and VP can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals')
  );

-- Junior officers can update their own events, VP can update all
CREATE POLICY "Users can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals' OR
    (public.get_user_role(auth.uid()) = 'junior_officer' AND created_by = auth.uid())
  );

-- VP can delete events
CREATE POLICY "VP can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

-- ENDORSEMENTS TABLE POLICIES
-- All authenticated users can view endorsements
CREATE POLICY "All users can view endorsements"
  ON public.endorsements FOR SELECT
  TO authenticated
  USING (true);

-- Junior officers and VP can create endorsements
CREATE POLICY "Junior officers and VP can create endorsements"
  ON public.endorsements FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals')
  );

-- VP and directors can update endorsements
CREATE POLICY "VP and directors can update endorsements"
  ON public.endorsements FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships') OR
    (public.get_user_role(auth.uid()) = 'junior_officer' AND created_by = auth.uid() AND status = 'drafted')
  );

-- VP can delete endorsements
CREATE POLICY "VP can delete endorsements"
  ON public.endorsements FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

-- PARTNERS TABLE POLICIES
-- All authenticated users can view partners
CREATE POLICY "All users can view partners"
  ON public.partners FOR SELECT
  TO authenticated
  USING (true);

-- Junior officers and VP can create partners
CREATE POLICY "Junior officers and VP can create partners"
  ON public.partners FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals')
  );

-- Junior officers, directors, and VP can update partners
CREATE POLICY "Users can update partners"
  ON public.partners FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships')
  );

-- VP can delete partners
CREATE POLICY "VP can delete partners"
  ON public.partners FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

-- EMAIL_LOGS TABLE POLICIES
-- All authenticated users can view email logs
CREATE POLICY "All users can view email logs"
  ON public.email_logs FOR SELECT
  TO authenticated
  USING (true);

-- Junior officers and VP can create email logs
CREATE POLICY "Junior officers and VP can create email logs"
  ON public.email_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals')
  );

-- Officers can update their own email logs, VP can update all
CREATE POLICY "Users can update email logs"
  ON public.email_logs FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals' OR
    officer_in_charge = auth.uid()
  );

-- VP can delete email logs
CREATE POLICY "VP can delete email logs"
  ON public.email_logs FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

-- TASKS TABLE POLICIES
-- Users can view tasks assigned to them or created by them, VP and directors can view all
CREATE POLICY "Users can view relevant tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('vp_externals', 'director_partnerships', 'director_sponsorships') OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

-- Junior officers and VP can create tasks
CREATE POLICY "Junior officers and VP can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('junior_officer', 'vp_externals')
  );

-- Assigned users can update task status, VP can update all
CREATE POLICY "Users can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals' OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

-- VP can delete tasks
CREATE POLICY "VP can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

-- TEMPLATES TABLE POLICIES
-- All authenticated users can view templates
CREATE POLICY "All users can view templates"
  ON public.templates FOR SELECT
  TO authenticated
  USING (true);

-- Only VP can create templates
CREATE POLICY "VP can create templates"
  ON public.templates FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

-- Only VP can update templates
CREATE POLICY "VP can update templates"
  ON public.templates FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );

-- Only VP can delete templates
CREATE POLICY "VP can delete templates"
  ON public.templates FOR DELETE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'vp_externals'
  );
