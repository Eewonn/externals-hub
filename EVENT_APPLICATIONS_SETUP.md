# Event Applications Feature - Quick Setup Guide

## Prerequisites
- Existing Externals Hub installation
- Supabase project configured
- Database migrations applied up to `20260129_*`

## Installation Steps

### 1. Apply Database Migration

In your Supabase SQL Editor, run the migration file:

```bash
# File: supabase/migrations/20260130_event_applications.sql
```

Or using Supabase CLI:
```bash
npx supabase migration up
```

This will:
- Create `event_applications` table
- Add RLS policies for guest and authenticated access
- Create necessary indexes
- Set up unique constraints

### 2. Verify Migration

Check that the table exists:
```sql
SELECT * FROM public.event_applications LIMIT 1;
```

Check RLS policies are active:
```sql
SELECT * FROM pg_policies WHERE tablename = 'event_applications';
```

### 3. Test Guest Access

1. Visit `/apply` in your browser (no login required)
2. You should see the application form
3. Available events should be listed (if any are endorsed or pending)

### 4. Test Internal Management

1. Login as VP Externals or Junior Officer
2. Navigate to `/applications` in the sidebar
3. You should see the applications dashboard

## Post-Installation Checklist

- [ ] Database migration applied successfully
- [ ] RLS policies enabled and working
- [ ] Guest users can access `/apply` page
- [ ] Events with endorsements appear in the dropdown
- [ ] Application submission works without errors
- [ ] Duplicate submissions are prevented
- [ ] Internal staff can access `/applications` page
- [ ] Export functionality works

## Troubleshooting

### Issue: No events showing on application page
**Solution**: 
1. Ensure you have events with `status = 'upcoming'`
2. Create an endorsement for the event with status 'approved' or 'submitted_to_sado'

Example SQL:
```sql
-- Check existing events
SELECT id, title, status FROM public.events WHERE status = 'upcoming';

-- Create a test endorsement (replace event_id and user_id)
INSERT INTO public.endorsements (event_id, gdrive_link, status, created_by)
VALUES (
  'your-event-id-here',
  'https://drive.google.com/drive/folders/test',
  'approved',
  'your-user-id-here'
);
```

### Issue: Guest submissions failing
**Solution**:
1. Check browser console for errors
2. Verify RLS policies:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'event_applications' 
AND policyname = 'Anyone can create event applications';
```
3. Ensure Supabase anon key is configured in `.env.local`

### Issue: Internal staff cannot view applications
**Solution**:
1. Verify user role in database:
```sql
SELECT id, email, role FROM public.users WHERE email = 'user@example.com';
```
2. Check if user is authenticated
3. Verify the RLS policy for authenticated users

## Testing Data

Create a test event with endorsement:

```sql
-- 1. Create a test event (as existing user)
INSERT INTO public.events (
  title, 
  description, 
  event_type, 
  school_associate, 
  event_date, 
  status,
  organizer,
  created_by
) VALUES (
  'Test Hackathon 2026',
  'A test event for application system',
  'competition',
  'UP Diliman',
  '2026-03-15',
  'upcoming',
  'ACM Student Chapter',
  (SELECT id FROM public.users WHERE role = 'vp_externals' LIMIT 1)
) RETURNING id;

-- 2. Create endorsement (use the returned id from above)
INSERT INTO public.endorsements (
  event_id, 
  gdrive_link, 
  status, 
  created_by
) VALUES (
  'event-id-from-above',
  'https://drive.google.com/drive/folders/test',
  'approved',
  (SELECT id FROM public.users WHERE role = 'vp_externals' LIMIT 1)
);
```

## Feature URLs

- **Guest Application Portal**: `/apply`
- **Applications Management**: `/applications` (requires auth)
- **Event Applications**: `/events/[id]/applications` (requires auth)

## API Endpoints

- `GET /api/applications` - List open events
- `POST /api/applications` - Submit application (guest)
- `GET /api/applications/all` - Get all applications (authenticated)

## Next Steps

1. Share `/apply` URL with potential participants
2. Monitor applications in `/applications` dashboard
3. Export participant lists before events
4. Consider adding the application link to event details pages
5. Optional: Add email notifications for new applications

## Support

Refer to [EVENT_APPLICATIONS.md](./EVENT_APPLICATIONS.md) for comprehensive documentation.
