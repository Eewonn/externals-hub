# Supabase Migrations

This directory contains clean, organized SQL migration files for the Externals Hub database.

## 📋 Migration Files

Run these files **in order** in your Supabase SQL Editor:

### 1. `00_cleanup.sql` (Optional)
⚠️ **WARNING: This will delete ALL existing data!**

Only run this if you want to start with a completely fresh database. This script:
- Drops all existing tables
- Drops all custom functions
- Drops all custom types

**When to use:**
- Fresh project setup
- Complete database reset
- Migrating from messy schema

### 2. `01_schema.sql` (Required)
Creates the complete database schema including:
- **Custom Types (Enums)**: user roles, statuses, categories
- **Tables**: users, events, endorsements, partners, tasks, templates, schedules, applications
- **Indexes**: For optimal query performance
- **Functions**: Helper functions for business logic
- **Triggers**: Auto-update timestamps and task completion

### 3. `02_rls_policies.sql` (Required)
Sets up Row Level Security (RLS) policies:
- **Access Control**: Role-based permissions (VP, Directors, Officers)
- **User Authentication**: Signup and login policies
- **Guest Access**: Anonymous users can view events and submit applications
- **Data Protection**: Users can only access/modify data they own or have permission for

### 4. `03_seed_data.sql` (Required)
Inserts initial data:
- **Default VP User**: Creates the first VP Externals user
- **Sample Data**: (Commented out) Optional sample events and competitions

## 🚀 Quick Start

### Option A: Fresh Database Setup

1. Open [Supabase SQL Editor](https://app.supabase.com/project/_/sql)
2. Run migrations in order:
   ```sql
   -- Step 1: Clean slate (optional, deletes everything)
   -- Copy and run 00_cleanup.sql
   
   -- Step 2: Create schema (required)
   -- Copy and run 01_schema.sql
   
   -- Step 3: Set up security (required)
   -- Copy and run 02_rls_policies.sql
   
   -- Step 4: Add initial data (required)
   -- Copy and run 03_seed_data.sql
   ```

### Option B: Update Existing Database

If you already have data and just want to add missing features:

1. **Don't run** `00_cleanup.sql`
2. Manually apply specific sections from `01_schema.sql` (tables/functions you're missing)
3. Update RLS policies from `02_rls_policies.sql` as needed

## 🔐 First Login

After running migrations, you can create the first user account:

1. Go to Supabase Authentication → Users
2. Click "Add User" manually, or
3. The seed data creates a default VP user:
   - Email: `madiaz@fit.edu.ph`
   - User ID: `e5329e1b-92dc-46f2-ae9d-06bdd50b055d`
   - Role: `vp_externals`
   - You'll need to set a password in Supabase Auth dashboard

## 📊 Database Structure

### Core Tables

- **users**: Extends Supabase auth.users with roles and approval status
- **events**: Competitions and general events with participants
- **endorsements**: Event approval workflow
- **partners**: Partner and sponsor organizations
- **email_logs**: Communication tracking
- **tasks**: Task management for officers
- **templates**: Document templates
- **competition_participants**: Detailed participant information
- **officer_schedules**: Officer class schedules
- **schedule_entries**: Individual schedule entries
- **event_applications**: Guest applications to events

### User Roles

- **vp_externals**: Full admin access
- **director_partnerships**: Manage partnerships and endorsements
- **director_sponsorships**: Manage sponsorships and endorsements
- **junior_officer**: Create events, tasks, and manage own content
- **adviser**: View all, approve users

### Approval Workflow

Users can have these approval statuses:
- **pending**: Awaiting admin approval (can't login)
- **approved**: Can access the system
- **rejected**: Access denied

## 🔧 Key Features

### Guest Applications
Anonymous users can:
- View upcoming events
- Submit applications via `/apply` page
- Applications use `submit_event_application()` function (bypasses RLS for reliability)

### Row Level Security
- VP Externals: Full access to everything
- Directors: Manage partnerships, endorsements, view all
- Junior Officers: Create/manage own content
- Users: View own profile and assigned tasks

### Auto-Timestamps
All tables automatically update `updated_at` on modifications via triggers.

### Task Management
Tasks automatically set `completed_at` when status changes to 'completed'.

## 🐛 Troubleshooting

### RLS Policy Errors
If you get "new row violates row-level security policy" errors:

1. Check you're using the correct Supabase key (anon for guests, service key for admin)
2. For guest applications, ensure they use the `submit_event_application()` function
3. Verify the user has the correct role in the `users` table

### Function Permission Errors
If you get "permission denied for function" errors:

```sql
-- Re-grant execute permissions
GRANT EXECUTE ON FUNCTION public.submit_event_application(UUID, TEXT, TEXT, TEXT, acm_membership_status, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_upcoming(UUID) TO anon, authenticated;
```

### Can't Login After Signup
Users created via signup start with `approval_status = 'pending'`. A VP must approve them:

```sql
UPDATE public.users 
SET approval_status = 'approved' 
WHERE email = 'user@example.com';
```

## 📝 Making Changes

To modify the schema:

1. Create a new migration file: `04_your_change.sql`
2. Use `ALTER TABLE` instead of `CREATE TABLE`
3. Add comments explaining the change
4. Test on a development database first

Example:
```sql
-- Add new column to events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS new_field TEXT;

-- Create index for new column
CREATE INDEX IF NOT EXISTS idx_events_new_field 
ON public.events(new_field);
```

## 🔒 Security Best Practices

1. **Never** disable RLS on tables with sensitive data
2. Use `SECURITY DEFINER` functions for guest access
3. Always validate input in functions
4. Grant minimal necessary permissions to roles
5. Review RLS policies regularly

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
