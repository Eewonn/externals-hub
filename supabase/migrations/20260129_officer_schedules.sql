-- Create officer_schedules table
create table if not exists officer_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  academic_year varchar(20) not null, -- e.g., "2025-2026"
  semester varchar(20) not null, -- e.g., "First Semester", "Second Semester"
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create schedule_entries table
create table if not exists schedule_entries (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references officer_schedules(id) on delete cascade not null,
  course_code varchar(50) not null,
  course_title text not null,
  section varchar(20) not null,
  units integer not null,
  days text[] not null, -- Array of day codes: M, T, W, Th, F, S
  time_ranges text[] not null, -- Array of time ranges: "HH:MM:SS-HH:MM:SS"
  rooms text[] not null, -- Array of room names
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create indexes for better query performance
create index idx_officer_schedules_user_id on officer_schedules(user_id);
create index idx_schedule_entries_schedule_id on schedule_entries(schedule_id);

-- Enable Row Level Security
alter table officer_schedules enable row level security;
alter table schedule_entries enable row level security;

-- RLS Policies for officer_schedules
-- Users can view all schedules
create policy "Users can view all officer schedules"
  on officer_schedules for select
  using (true);

-- Only the schedule owner or VP Externals can insert/update/delete their own schedule
create policy "Users can manage their own schedule"
  on officer_schedules for all
  using (
    auth.uid() = user_id or
    exists (
      select 1 from users
      where users.id = auth.uid() and users.role = 'vp_externals'
    )
  );

-- RLS Policies for schedule_entries
-- Users can view all schedule entries
create policy "Users can view all schedule entries"
  on schedule_entries for select
  using (true);

-- Only the schedule owner or VP Externals can manage entries
create policy "Users can manage their own schedule entries"
  on schedule_entries for all
  using (
    exists (
      select 1 from officer_schedules os
      where os.id = schedule_entries.schedule_id
      and (
        os.user_id = auth.uid() or
        exists (
          select 1 from users
          where users.id = auth.uid() and users.role = 'vp_externals'
        )
      )
    )
  );

-- Add updated_at trigger function if it doesn't exist
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger update_officer_schedules_updated_at
  before update on officer_schedules
  for each row
  execute function update_updated_at_column();

create trigger update_schedule_entries_updated_at
  before update on schedule_entries
  for each row
  execute function update_updated_at_column();
