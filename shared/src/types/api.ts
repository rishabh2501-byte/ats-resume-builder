// API Request/Response Types

import { Resume, ATSAnalysis, JobDescription, ExportFormat, ExportOptions } from './resume';

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  subscription: 'free' | 'pro' | 'enterprise';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Resume API
export interface CreateResumeRequest {
  name: string;
  template?: string;
}

export interface UpdateResumeRequest {
  resume: Partial<Resume>;
}

export interface ResumeResponse {
  success: boolean;
  data: Resume;
  message?: string;
}

export interface ResumesListResponse {
  success: boolean;
  data: Resume[];
  total: number;
  page: number;
  limit: number;
}

// ATS Analysis API
export interface AnalyzeResumeRequest {
  resumeText: string;
  jobDescription: string;
}

export interface AnalyzeResumeResponse {
  success: boolean;
  data: ATSAnalysis;
}

// AI Optimization API
export interface OptimizeRequest {
  resumeId: string;
  jobDescription: string;
  sections?: string[];
}

export interface GenerateBulletsRequest {
  position: string;
  company: string;
  responsibilities: string;
  keywords?: string[];
}

export interface RewriteContentRequest {
  content: string;
  targetKeywords: string[];
  tone?: 'professional' | 'casual' | 'technical';
}

export interface AIResponse {
  success: boolean;
  data: {
    content: string;
    suggestions?: string[];
    tokensUsed?: number;
  };
}

// Export API
export interface ExportRequest {
  resumeId: string;
  options: ExportOptions;
}

export interface ExportResponse {
  success: boolean;
  data: {
    url?: string;
    buffer?: ArrayBuffer;
    filename: string;
  };
}

// Job Description API
export interface ExtractJDRequest {
  url?: string;
  html?: string;
  text?: string;
}

export interface ExtractJDResponse {
  success: boolean;
  data: JobDescription;
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}
