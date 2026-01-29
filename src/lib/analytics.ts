import { track } from '@vercel/analytics';

/**
 * Custom analytics events for tracking user actions
 */

export const analytics = {
  // Event tracking
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    track(eventName, properties);
  },

  // Specific event trackers
  events: {
    // Events & Competitions
    eventCreated: (eventType: string, category?: string) => {
      track('Event Created', { eventType, category });
    },
    eventViewed: (eventId: string) => {
      track('Event Viewed', { eventId });
    },
    eventExported: (count: number) => {
      track('Events Exported', { count });
    },

    // Endorsements
    endorsementCreated: (organization: string) => {
      track('Endorsement Created', { organization });
    },
    endorsementStatusChanged: (status: string) => {
      track('Endorsement Status Changed', { status });
    },

    // Partners
    partnerCreated: (partnerType: string) => {
      track('Partner Created', { partnerType });
    },
    partnerViewed: (partnerId: string) => {
      track('Partner Viewed', { partnerId });
    },

    // Tasks
    taskCreated: (assignedTo: string) => {
      track('Task Created', { assignedTo });
    },
    taskCompleted: (taskId: string) => {
      track('Task Completed', { taskId });
    },
    taskStatusChanged: (oldStatus: string, newStatus: string) => {
      track('Task Status Changed', { oldStatus, newStatus });
    },

    // Users
    userCreated: (role: string) => {
      track('User Created', { role });
    },
    userRoleChanged: (oldRole: string, newRole: string) => {
      track('User Role Changed', { oldRole, newRole });
    },
    userDeleted: (role: string) => {
      track('User Deleted', { role });
    },

    // Schedules
    scheduleCreated: (academicYear: string, semester: string) => {
      track('Schedule Created', { academicYear, semester });
    },

    // Templates
    templateViewed: (templateId: string, category: string) => {
      track('Template Viewed', { templateId, category });
    },

    // Communications
    communicationSent: (type: string) => {
      track('Communication Sent', { type });
    },

    // Authentication
    userLoggedIn: () => {
      track('User Logged In');
    },
    userLoggedOut: () => {
      track('User Logged Out');
    },

    // Search & Filters
    searchPerformed: (query: string, page: string) => {
      track('Search Performed', { query: query.substring(0, 50), page });
    },
    filterApplied: (filterType: string, value: string, page: string) => {
      track('Filter Applied', { filterType, value, page });
    },
  }
};

// Helper to track page views (automatically tracked by Vercel Analytics)
export const trackPageView = (path: string) => {
  track('Page View', { path });
};
