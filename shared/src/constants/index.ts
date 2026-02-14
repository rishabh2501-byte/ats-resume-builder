// Application Constants

export const APP_NAME = 'ATS Resume Builder';
export const APP_VERSION = '1.0.0';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  RESUME: {
    BASE: '/api/resumes',
    BY_ID: (id: string) => `/api/resumes/${id}`,
    EXPORT: (id: string) => `/api/resumes/${id}/export`,
    DUPLICATE: (id: string) => `/api/resumes/${id}/duplicate`,
  },
  ATS: {
    ANALYZE: '/api/ats/analyze',
    SCORE: '/api/ats/score',
    KEYWORDS: '/api/ats/keywords',
  },
  AI: {
    OPTIMIZE: '/api/ai/optimize',
    GENERATE_BULLETS: '/api/ai/generate-bullets',
    REWRITE: '/api/ai/rewrite',
    SUGGEST_KEYWORDS: '/api/ai/suggest-keywords',
    IMPROVE_GRAMMAR: '/api/ai/improve-grammar',
  },
  JOB: {
    EXTRACT: '/api/job/extract',
    SAVE: '/api/job/save',
    LIST: '/api/job/list',
  },
} as const;

// Resume Templates
export const RESUME_TEMPLATES = {
  CLASSIC: 'classic',
  MODERN: 'modern',
  MINIMAL: 'minimal',
  PROFESSIONAL: 'professional',
  CREATIVE: 'creative',
} as const;

// Default Section Order
export const DEFAULT_SECTION_ORDER = [
  'personal',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
] as const;

// Skill Categories
export const SKILL_CATEGORIES = [
  { value: 'technical', label: 'Technical Skills' },
  { value: 'soft', label: 'Soft Skills' },
  { value: 'language', label: 'Languages' },
  { value: 'tool', label: 'Tools' },
  { value: 'framework', label: 'Frameworks' },
  { value: 'other', label: 'Other' },
] as const;

// Skill Levels
export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
] as const;

// Export Formats
export const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', icon: 'file-text' },
  { value: 'docx', label: 'Word Document', icon: 'file' },
  { value: 'txt', label: 'Plain Text', icon: 'file-text' },
  { value: 'json', label: 'JSON', icon: 'code' },
] as const;

// ATS Score Thresholds
export const ATS_SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40,
  POOR: 0,
} as const;

// Common ATS Keywords by Category
export const COMMON_ATS_KEYWORDS = {
  TECHNICAL: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js',
    'SQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'REST API', 'GraphQL',
    'MongoDB', 'PostgreSQL', 'Redis', 'CI/CD', 'Agile', 'Scrum',
  ],
  SOFT_SKILLS: [
    'Leadership', 'Communication', 'Problem-solving', 'Team collaboration',
    'Project management', 'Time management', 'Critical thinking',
    'Adaptability', 'Creativity', 'Attention to detail',
  ],
  ACTION_VERBS: [
    'Achieved', 'Implemented', 'Developed', 'Led', 'Managed', 'Created',
    'Designed', 'Improved', 'Increased', 'Reduced', 'Optimized', 'Delivered',
    'Launched', 'Built', 'Established', 'Streamlined', 'Transformed',
  ],
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ats_auth_token',
  REFRESH_TOKEN: 'ats_refresh_token',
  USER: 'ats_user',
  CURRENT_RESUME: 'ats_current_resume',
  RESUMES: 'ats_resumes',
  SETTINGS: 'ats_settings',
  THEME: 'ats_theme',
} as const;

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s\-+()]{10,}$/,
  URL_REGEX: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_SUMMARY_LENGTH: 500,
  MAX_BULLET_LENGTH: 200,
} as const;
