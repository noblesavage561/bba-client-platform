/**
 * Shared constants for BBA Client Platform
 */

export const CLIENT_STATUSES = ['active', 'inactive', 'pending', 'archived'] as const;
export const USER_ROLES = ['admin', 'advisor', 'client'] as const;
export const DOCUMENT_TYPES = [
  'tax_return',
  'bank_statement',
  'investment_statement',
  'insurance_policy',
  'other',
] as const;
export const DOCUMENT_STATUSES = ['pending', 'processing', 'analyzed', 'error'] as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  CLIENTS: {
    LIST: '/clients',
    CREATE: '/clients',
    GET: (id: string) => `/clients/${id}`,
    UPDATE: (id: string) => `/clients/${id}`,
    DELETE: (id: string) => `/clients/${id}`,
  },
  DOCUMENTS: {
    LIST: '/documents',
    CREATE: '/documents',
    GET: (id: string) => `/documents/${id}`,
    ANALYZE: (id: string) => `/documents/${id}/analyze`,
  },
} as const;
