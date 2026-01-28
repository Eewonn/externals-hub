# Externals Hub - Setup Guide

## 📋 What We've Built So Far

### ✅ Completed Components

1. **Project Foundation**
   - Next.js 15 with TypeScript and App Router
   - Tailwind CSS with shadcn/ui component library
   - Project structure and configuration

2. **Database Schema**
   - Complete SQL migrations for all tables
   - Row Level Security (RLS) policies
   - Database triggers and functions
   - TypeScript types matching the schema

3. **Authentication System**
   - Supabase Auth integration
   - Login page with modern UI
   - Auth callback handler
   - Protected route middleware
   - Role-based permission system

4. **Core UI Components**
   - Sidebar navigation
   - Dashboard layout
   - Dashboard page with statistics
   - Login page
   - Reusable UI components (buttons, cards, inputs, etc.)

---

## 🚀 Next Steps to Get Running

### Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: Externals Hub
   - **Database Password**: (create a strong password and save it)
   - **Region**: Choose closest to your location
4. Click **"Create new project"** and wait for setup to complete (~2 minutes)

### Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need three values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

### Step 3: Configure Environment Variables

1. In your project directory, create a `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### Step 4: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/20260128_initial_schema.sql`
4. Paste into the SQL editor and click **"Run"**
5. You should see "Success. No rows returned"
6. Repeat for `supabase/migrations/20260128_rls_policies.sql`

**Verify tables were created:**
- Go to **Table Editor** in Supabase
- You should see: users, events, endorsements, partners, email_logs, tasks, templates

### Step 5: Create Your First User (VP Externals)

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: your email
   - **Password**: create a password (at least 6 characters)
   - **Auto Confirm User**: ✅ (check this box)
4. Click **"Create user"**
5. Copy the **User UID** (it's a long UUID like `a1b2c3d4-...`)

6. Go back to **SQL Editor** and run this query (replace the values):
   ```sql
   INSERT INTO public.users (id, email, full_name, role)
   VALUES (
     'paste-the-user-uid-here',
     'your-email@example.com',
     'Your Full Name',
     'vp_externals'
   );
   ```

### Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should be redirected to the login page. Use the email and password you created in Step 5.

---

## 🎯 What You Should See

After logging in successfully:

1. **Dashboard Page** with:
   - Welcome message with your name
   - Your role badge (VP Externals)
   - Statistics cards (will show 0 initially)
   - Quick action cards

2. **Sidebar Navigation** with links to:
   - Dashboard
   - Events
   - Endorsements
   - Partners
   - Communications
   - Templates
   - Tasks

---

## 🔧 Troubleshooting

### "Cannot connect to Supabase"
- Check that your `.env.local` file exists and has the correct values
- Restart the dev server after changing environment variables
- Verify your Supabase project is active (not paused)

### "User not found" or "Invalid credentials"
- Make sure you created the user in **both** places:
  1. Authentication → Users (for login)
  2. SQL query to insert into `public.users` table (for role/profile)
- Check that the UUID matches between auth.users and public.users

### Build errors
- The build will fail without environment variables - this is normal
- Make sure all dependencies are installed: `npm install`
- Clear Next.js cache: `rm -rf .next` then `npm run dev`

### RLS Policy errors
- If you can't see data after logging in, check that RLS policies were applied
- Re-run the `20260128_rls_policies.sql` migration
- Check Supabase logs in **Database** → **Logs**

---

## 📝 Next Development Tasks

Once you have the system running, the next features to implement are:

1. **Events Module**
   - Events listing page
   - Create event form
   - Event detail page
   - Edit event functionality

2. **Endorsements Module**
   - Endorsements listing
   - Submit endorsement form
   - Review workflow for VP

3. **Partners Module**
   - Partners listing
   - Add partner form
   - Partner detail page

4. **And more...**

Check `task.md` for the complete task list.

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Check the terminal where `npm run dev` is running
3. Check Supabase logs in the dashboard
4. Verify environment variables are loaded: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`

---

## 🎉 Success Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database migrations run successfully
- [ ] First user created (VP Externals)
- [ ] Development server running
- [ ] Successfully logged in
- [ ] Dashboard displays correctly

Once all items are checked, you're ready to start building the feature modules!
