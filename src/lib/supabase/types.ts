export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UserRole =
    | 'vp_externals'
    | 'junior_officer'
    | 'director_partnerships'
    | 'director_sponsorships'
    | 'adviser'

export type EventType = 'competition' | 'event'

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export type CompetitionCategory = 'local_regional' | 'local_national' | 'international'

export type CompetitionNature = 'academic' | 'non_academic'

export type EndorsementStatus =
    | 'drafted'
    | 'vpe_reviewed'
    | 'submitted_to_sado'
    | 'approved'
    | 'rejected'

export type PartnerStatus =
    | 'potential'
    | 'contacted'
    | 'ongoing_coordination'
    | 'active_partner'
    | 'inactive'

export type RelationshipType = 'partner' | 'sponsor'

export type EmailStatus = 'sent' | 'replied' | 'no_response'

export type TaskStatus = 'pending' | 'ongoing' | 'completed' | 'blocked'

export type TemplateCategory =
    | 'email'
    | 'endorsement'
    | 'apf'
    | 'app'
    | 'post_event_report'
    | 'other'

export type ACMMembershipStatus = 'yes' | 'no' | 'not_sure'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface EventApplication {
    id: string
    event_id: string
    full_name: string
    student_number: string
    student_email: string
    acm_membership_status: ACMMembershipStatus
    course_year_level: string
    applied_at: string
    created_at: string
    updated_at: string
}

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    full_name: string
                    role: UserRole
                    approval_status: ApprovalStatus
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name: string
                    role: UserRole
                    approval_status?: ApprovalStatus
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string
                    role?: UserRole
                    approval_status?: ApprovalStatus
                    created_at?: string
                    updated_at?: string
                }
            }
            events: {
                Row: {
                    id: string
                    title: string
                    description: string
                    event_type: EventType
                    school_associate: string
                    participant_names: string[]
                    participant_count: number
                    event_date: string
                    status: EventStatus
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    event_type: EventType
                    school_associate: string
                    participant_names: string[]
                    participant_count?: number
                    event_date: string
                    status?: EventStatus
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    event_type?: EventType
                    school_associate?: string
                    participant_names?: string[]
                    participant_count?: number
                    event_date?: string
                    status?: EventStatus
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            endorsements: {
                Row: {
                    id: string
                    event_id: string
                    gdocs_url: string
                    gforms_submission_url: string | null
                    status: EndorsementStatus
                    reviewed_by: string | null
                    reviewed_at: string | null
                    submitted_at: string | null
                    approved_at: string | null
                    notes: string | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    event_id: string
                    gdocs_url: string
                    gforms_submission_url?: string | null
                    status?: EndorsementStatus
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                    submitted_at?: string | null
                    approved_at?: string | null
                    notes?: string | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    event_id?: string
                    gdocs_url?: string
                    gforms_submission_url?: string | null
                    status?: EndorsementStatus
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                    submitted_at?: string | null
                    approved_at?: string | null
                    notes?: string | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            event_applications: {
                Row: {
                    id: string
                    event_id: string
                    full_name: string
                    student_number: string
                    student_email: string
                    acm_membership_status: ACMMembershipStatus
                    course_year_level: string
                    applied_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    event_id: string
                    full_name: string
                    student_number: string
                    student_email: string
                    acm_membership_status: ACMMembershipStatus
                    course_year_level: string
                    applied_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    event_id?: string
                    full_name?: string
                    student_number?: string
                    student_email?: string
                    acm_membership_status?: ACMMembershipStatus
                    course_year_level?: string
                    applied_at?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            partners: {
                Row: {
                    id: string
                    name: string
                    organization_type: string
                    contact_person: string | null
                    contact_email: string | null
                    contact_phone: string | null
                    status: PartnerStatus
                    relationship_type: RelationshipType
                    notes: string | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    organization_type: string
                    contact_person?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    status?: PartnerStatus
                    relationship_type: RelationshipType
                    notes?: string | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    organization_type?: string
                    contact_person?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    status?: PartnerStatus
                    relationship_type?: RelationshipType
                    notes?: string | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            email_logs: {
                Row: {
                    id: string
                    partner_id: string
                    recipient: string
                    email_type: string
                    subject: string
                    officer_in_charge: string
                    status: EmailStatus
                    sent_at: string
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    partner_id: string
                    recipient: string
                    email_type: string
                    subject: string
                    officer_in_charge: string
                    status?: EmailStatus
                    sent_at: string
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    partner_id?: string
                    recipient?: string
                    email_type?: string
                    subject?: string
                    officer_in_charge?: string
                    status?: EmailStatus
                    sent_at?: string
                    notes?: string | null
                    created_at?: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    assigned_to: string
                    event_id: string | null
                    partner_id: string | null
                    deadline: string
                    status: TaskStatus
                    created_by: string
                    created_at: string
                    updated_at: string
                    completed_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    assigned_to: string
                    event_id?: string | null
                    partner_id?: string | null
                    deadline: string
                    status?: TaskStatus
                    created_by: string
                    created_at?: string
                    updated_at?: string
                    completed_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    assigned_to?: string
                    event_id?: string | null
                    partner_id?: string | null
                    deadline?: string
                    status?: TaskStatus
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                    completed_at?: string | null
                }
            }
            templates: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    category: TemplateCategory
                    external_url: string
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    category: TemplateCategory
                    external_url: string
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    category?: TemplateCategory
                    external_url?: string
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            officer_schedules: {
                Row: {
                    id: string
                    user_id: string
                    academic_year: string
                    semester: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    academic_year: string
                    semester: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    academic_year?: string
                    semester?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            schedule_entries: {
                Row: {
                    id: string
                    schedule_id: string
                    course_code: string
                    course_title: string
                    section: string
                    units: number
                    days: string[]
                    time_ranges: string[]
                    rooms: string[]
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    schedule_id: string
                    course_code: string
                    course_title: string
                    section: string
                    units: number
                    days: string[]
                    time_ranges: string[]
                    rooms: string[]
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    schedule_id?: string
                    course_code?: string
                    course_title?: string
                    section?: string
                    units?: number
                    days?: string[]
                    time_ranges?: string[]
                    rooms?: string[]
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
