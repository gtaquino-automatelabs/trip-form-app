export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
  },
  FORM: {
    SUBMIT: '/api/form/submit',
    DRAFT: '/api/form/draft',
  },
  ADMIN: {
    REQUESTS: '/api/admin/requests',
    EXPORT: '/api/admin/export',
  },
  HEALTH: '/api/health',
} as const;

export const REQUEST_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;