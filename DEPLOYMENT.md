# Deployment Checklist for Vercel

## ✅ Pre-Deployment Steps

### 1. Environment Variables Setup
You'll need to set these in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Setup
- [ ] Create Supabase project (if not done)
- [ ] Run all migrations from `supabase/migrations/` folder
- [ ] Verify RLS policies are enabled
- [ ] Test database connection

### 3. Run Migrations
In your Supabase dashboard:
- Go to SQL Editor
- Run each migration file in order:
  1. `20260128_initial_schema.sql`
  2. `20260128_rls_policies.sql`
  3. `20260129_officer_schedules.sql`
  4. `20260129_competitions_structure.sql`
  5. `20260129_seed_competitions.sql`
  6. `20260129_seed_events.sql`
  7. `20260129_add_user_delete_policy.sql`

Or use Supabase CLI:
```bash
npx supabase db reset
```

### 4. Test Locally First
```bash
npm run build
npm run start
```

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Deploy via Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables
5. Click "Deploy"

### Option 3: Deploy via GitHub Integration
1. Push to your GitHub repository
2. Connect repository to Vercel
3. Auto-deploy on every push

## ⚙️ Post-Deployment

### 1. Verify Deployment
- [ ] Check all pages load correctly
- [ ] Test authentication flow
- [ ] Verify database connections
- [ ] Check analytics in Vercel dashboard

### 2. Create First User
You'll need to create your first VP Externals user manually in Supabase:
1. Go to Supabase Authentication
2. Create user with email/password
3. Go to Table Editor → users table
4. Update the user's role to 'vp_externals'

### 3. Enable Analytics
- [ ] Analytics automatically enabled (no setup needed!)
- [ ] Check Vercel Analytics tab after deployment
- [ ] Speed Insights available immediately

## 🔒 Security Checks
- [ ] RLS policies enabled on all tables
- [ ] Environment variables not committed to git
- [ ] .env files in .gitignore
- [ ] Auth callback URL configured in Supabase

## 📱 Features to Test
- [ ] Mobile responsiveness
- [ ] Login/logout
- [ ] Role-based access
- [ ] CRUD operations (events, partners, endorsements, tasks)
- [ ] File uploads (if any)
- [ ] CSV exports
- [ ] Schedule management
- [ ] FAQ chatbot

## 🎯 Production URLs
After deployment, you'll get:
- Production URL: `https://your-app.vercel.app`
- Analytics: `https://vercel.com/[your-username]/[project]/analytics`

## 🐛 Troubleshooting
If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Check Supabase logs for database errors
4. Ensure all migrations ran successfully
5. Verify RLS policies allow your operations

## 📞 Need Help?
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
