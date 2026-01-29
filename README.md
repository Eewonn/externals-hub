# Externals Hub

An internal web application for managing the Externals Committee's operational workflow, including endorsement tracking, event management, partner relationships, and task accountability.

## ✨ Features Implemented

### ✅ Core Modules (COMPLETE)

- **Events & Competitions** - Full CRUD operations with participant tracking
- **Endorsements** - Google Docs integration with approval workflow
- **Event Applications** - Public application portal for endorsed events (see [EVENT_APPLICATIONS.md](./EVENT_APPLICATIONS.md))
- **Partners & Sponsors** - Contact management with status tracking
- **Templates Hub** - Categorized access to Google Drive templates
- **Tasks & Accountability** - Priority-based task tracking

### 🔐 Authentication & Authorization

- Role-based access control (5 roles: VP Externals, Junior Officer, Directors, Adviser)
- Protected routes with middleware
- Granular permissions per module
- Guest access for public application submissions

### 📊 Dashboard

- Statistics overview
- Quick action cards
- Role-based navigation

---

## 🚀 Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel (frontend) + Supabase Cloud (backend)

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account ([supabase.com](https://supabase.com))
- Git

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd externals-hub
npm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to **Project Settings** → **API**
4. Copy your **Project URL** and **anon public** key

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 4. Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/20260128_initial_schema.sql`
4. Run the query
5. Repeat for `supabase/migrations/20260128_rls_policies.sql`

Alternatively, if you have the Supabase CLI installed:
```bash
npx supabase db push
```

### 5. Create Your First User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. After creating the user, go to **SQL Editor** and run:
   ```sql
   INSERT INTO public.users (id, email, full_name, role)
   VALUES (
     'user_id_from_auth_users',
     'your-email@example.com',
     'Your Full Name',
     'vp_externals'
   );
   ```
   Replace `user_id_from_auth_users` with the actual UUID from the auth.users table.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
externals-hub/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── events/             # Events management
│   │   ├── endorsements/       # Endorsement tracking
│   │   ├── partners/           # Partner management
│   │   ├── communications/     # Email logs
│   │   ├── templates/          # Template access hub
│   │   ├── tasks/              # Task management
│   │   └── login/              # Authentication
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── layout/             # Layout components
│   ├── lib/                    # Utilities and helpers
│   │   ├── supabase/           # Supabase clients and types
│   │   └── auth/               # Permission utilities
│   └── middleware.ts           # Auth middleware
├── supabase/
│   └── migrations/             # Database migrations
└── public/                     # Static assets
```

## 👥 User Roles

- **VP Externals**: Full system access, can manage users and templates
- **Junior Officer**: Create and update events, endorsements, partners, tasks
- **Director (Partnerships)**: Review endorsements and partners, view-only for most
- **Director (Sponsorships)**: Review endorsements and sponsors, view-only for most
- **Adviser**: View-only access (optional)

## 🔐 Authentication

The system uses Supabase Auth with email/password authentication. Role-based access control (RBAC) is implemented through:

- Database-level Row Level Security (RLS) policies
- Application-level permission checks
- Protected routes via Next.js middleware

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings
4. Deploy!

### Supabase Production

Your Supabase project is already in production mode. Make sure to:
- Enable email confirmations in **Authentication** → **Settings**
- Configure email templates
- Set up proper CORS policies if needed

## 📝 Key Features

- ✅ **Events & Competitions Management**: Track events with participant names
- ✅ **Endorsement Workflow**: Google Docs integration for letter drafting
- ✅ **Partner & Sponsor Database**: Relationship tracking and status management
- ✅ **Email Communications Log**: Track all outreach efforts
- ✅ **Template Access Hub**: Centralized links to Google Docs templates
- ✅ **Task Management**: Assign and track tasks with deadlines
- ✅ **Role-Based Access Control**: Granular permissions per user role

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 🤝 Contributing

This is an internal project for the Externals Committee. For questions or issues, contact the VP Externals.

## 📄 License

Internal use only - Externals Committee
