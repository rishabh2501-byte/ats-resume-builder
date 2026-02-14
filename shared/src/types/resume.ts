// Resume Data Models

export interface PersonalInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  bullets: string[];
  keywords: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  achievements: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}

export type SkillCategory = 
  | 'technical'
  | 'soft'
  | 'language'
  | 'tool'
  | 'framework'
  | 'other';

export type SkillLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate: string;
  endDate: string | null;
  bullets: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  order: number;
}

export type SectionType = 
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'custom';

export interface Resume {
  id: string;
  userId?: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  template: ResumeTemplate;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  sections: ResumeSection[];
  customSections?: CustomSection[];
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  order: number;
  visible: boolean;
}

export type ResumeTemplate = 
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'professional'
  | 'creative';

// ATS Analysis Types
export interface ATSAnalysis {
  score: number;
  keywordMatches: KeywordMatch[];
  missingKeywords: string[];
  sectionScores: SectionScore[];
  suggestions: Suggestion[];
  formatIssues: FormatIssue[];
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  count: number;
  importance: 'high' | 'medium' | 'low';
}

export interface SectionScore {
  section: SectionType;
  score: number;
  feedback: string;
}

export interface Suggestion {
  id: string;
  type: 'keyword' | 'format' | 'content' | 'structure';
  priority: 'high' | 'medium' | 'low';
  section: SectionType;
  message: string;
  action?: string;
}

export interface FormatIssue {
  id: string;
  type: 'length' | 'formatting' | 'structure' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: string;
}

// Job Description Types
export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  keywords: string[];
  source: 'linkedin' | 'naukri' | 'indeed' | 'manual' | 'other';
  url?: string;
  extractedAt: string;
}

// Export Types
export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  template: ResumeTemplate;
  includeColors: boolean;
  fontSize: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}
