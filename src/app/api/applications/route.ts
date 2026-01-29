import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to create an anon Supabase client for each request
function getAnonClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getAnonClient();

    // Get open events (endorsed or pending endorsement)
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_date,
        organizer,
        endorsements (
          status
        )
      `)
      .eq('status', 'upcoming')
      .order('event_date', { ascending: true });

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    // Filter events to show only those with endorsed or pending endorsement status
    const openEvents = events
      ?.filter((event) => {
        const endorsement = event.endorsements?.[0];
        // Show if endorsed (approved/submitted/vpe_reviewed) or if no endorsement exists yet
        // This matches the RLS policy in the database
        return (
          !endorsement ||
          endorsement.status === 'approved' ||
          endorsement.status === 'submitted_to_sado' ||
          endorsement.status === 'vpe_reviewed'
        );
      })
      .map((event) => ({
        id: event.id,
        title: event.title,
        eventDate: event.event_date,
        organizer: event.organizer,
        status: event.endorsements?.[0]?.status || 'pending_endorsement',
      })) || [];

    return NextResponse.json({ events: openEvents });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getAnonClient();

    const body = await request.json();

    const {
      eventId,
      fullName,
      studentNumber,
      studentEmail,
      acmMembershipStatus,
      courseYearLevel,
    } = body;

    // Validate required fields
    if (
      !eventId ||
      !fullName ||
      !studentNumber ||
      !studentEmail ||
      !acmMembershipStatus ||
      !courseYearLevel
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate ACM membership status
    if (!['yes', 'no', 'not_sure'].includes(acmMembershipStatus)) {
      return NextResponse.json(
        { error: 'Invalid ACM membership status' },
        { status: 400 }
      );
    }

    // Verify event exists and is open for applications
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(
        `
        id,
        title,
        status,
        endorsements (
          status
        )
      `
      )
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if event is upcoming
    if (event.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Event is not open for applications' },
        { status: 400 }
      );
    }

    // Check if event is endorsed or pending endorsement
    const endorsement = event.endorsements?.[0];
    if (
      endorsement &&
      endorsement.status !== 'approved' &&
      endorsement.status !== 'submitted_to_sado'
    ) {
      return NextResponse.json(
        { error: 'Event is not available for applications yet' },
        { status: 400 }
      );
    }

    // Create the application using the SECURITY DEFINER function
    // This bypasses RLS issues by using elevated privileges
    const { data: applicationId, error: insertError } = await supabase
      .rpc('submit_event_application', {
        p_event_id: eventId,
        p_full_name: fullName,
        p_student_number: studentNumber,
        p_student_email: studentEmail,
        p_acm_membership_status: acmMembershipStatus,
        p_course_year_level: courseYearLevel,
      });

    if (insertError) {
      // Check if it's a unique constraint violation (student already applied)
      if (insertError.code === '23505' || insertError.message?.includes('unique_student_per_event')) {
        return NextResponse.json(
          {
            error:
              'You have already applied to this event with this email address',
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully',
        applicationId,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
