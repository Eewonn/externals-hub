# Endorsements Table Update Summary

## Changes Made

Updated the endorsements table to use a single **Google Drive link** instead of separate fields for Google Docs letter URL and Google Forms submission URL.

### Database Changes

**Old Schema:**
- `gdocs_url` (TEXT NOT NULL) - Google Docs letter URL
- `gforms_submission_url` (TEXT) - Optional Google Forms submission URL

**New Schema:**
- `gdrive_link` (TEXT NOT NULL) - Google Drive folder/link containing all endorsement documents

### Files Modified

1. **Database Migration**
   - ✅ [supabase/migrations/01_schema.sql](supabase/migrations/01_schema.sql) - Updated endorsements table definition
   - ✅ [supabase/migrations/03_update_endorsements_gdrive.sql](supabase/migrations/03_update_endorsements_gdrive.sql) - New migration file
   - ✅ [apply-endorsements-update.sql](apply-endorsements-update.sql) - Standalone SQL script for immediate application

2. **TypeScript Types**
   - ✅ [src/lib/supabase/types.ts](src/lib/supabase/types.ts) - Updated Row, Insert, and Update types

3. **UI Components**
   - ✅ [src/app/(app)/endorsements/new/page.tsx](src/app/(app)/endorsements/new/page.tsx) - Updated form to use single Google Drive link field
   - ✅ [src/app/(app)/endorsements/[id]/page.tsx](src/app/(app)/endorsements/[id]/page.tsx) - Updated detail view

4. **Documentation**
   - ✅ [EVENT_APPLICATIONS_SETUP.md](EVENT_APPLICATIONS_SETUP.md) - Updated example SQL queries

## How to Apply

### Option 1: Using Supabase Dashboard (Recommended)
1. Open your Supabase Dashboard → SQL Editor
2. Copy the contents of `apply-endorsements-update.sql`
3. Run the script

### Option 2: Using Migration File
If you're using Supabase CLI:
```bash
supabase migration up
```

The migration will:
1. Add the new `gdrive_link` column
2. Copy existing `gdocs_url` data to `gdrive_link` (preserves existing data)
3. Drop the old `gdocs_url` and `gforms_submission_url` columns
4. Set `gdrive_link` as NOT NULL

## Testing

After applying the migration:

1. Try creating a new endorsement at `/endorsements/new`
2. Use a Google Drive link (e.g., `https://drive.google.com/drive/folders/...`)
3. Verify the endorsement displays correctly at `/endorsements/[id]`

## Note

The migration preserves existing data by copying `gdocs_url` values to the new `gdrive_link` column before dropping the old columns.
