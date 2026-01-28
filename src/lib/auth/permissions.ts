import { UserRole } from '@/lib/supabase/types'

export const PERMISSIONS = {
    // Event permissions
    canCreateEvent: (role: UserRole) =>
        ['vp_externals', 'junior_officer'].includes(role),

    canEditEvent: (role: UserRole) =>
        ['vp_externals', 'junior_officer'].includes(role),

    canUpdateEventStatus: (role: UserRole) =>
        role === 'vp_externals',

    // Endorsement permissions
    canCreateEndorsement: (role: UserRole) =>
        ['vp_externals', 'junior_officer'].includes(role),

    canReviewEndorsement: (role: UserRole) =>
        ['vp_externals', 'director_partnerships', 'director_sponsorships'].includes(role),

    canUpdateEndorsementStatus: (role: UserRole) =>
        role === 'vp_externals',

    // Partner permissions
    canCreatePartner: (role: UserRole) =>
        ['vp_externals', 'junior_officer'].includes(role),

    canEditPartner: (role: UserRole) =>
        ['vp_externals', 'junior_officer'].includes(role),

    canUpdatePartnerStatus: (role: UserRole) =>
        ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships'].includes(role),

    // Communication permissions
    canLogCommunication: (role: UserRole) =>
        ['vp_externals', 'junior_officer'].includes(role),

    // Task permissions
    canCreateTask: (role: UserRole) =>
        ['vp_externals', 'junior_officer'].includes(role),

    canAssignTask: (role: UserRole) =>
        ['vp_externals', 'junior_officer'].includes(role),

    canUpdateTaskStatus: (role: UserRole) =>
        ['vp_externals', 'junior_officer'].includes(role),

    // Template permissions
    canManageTemplates: (role: UserRole) =>
        role === 'vp_externals',

    canViewTemplates: (role: UserRole) =>
        true, // All authenticated users can view templates

    // User management permissions
    canManageUsers: (role: UserRole) =>
        role === 'vp_externals',

    // General view permissions
    canViewAll: (role: UserRole) =>
        ['vp_externals', 'director_partnerships', 'director_sponsorships', 'adviser'].includes(role),
}

export function hasPermission(
    role: UserRole,
    permission: keyof typeof PERMISSIONS
): boolean {
    return PERMISSIONS[permission](role)
}
