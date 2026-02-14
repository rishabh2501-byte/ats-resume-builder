import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export interface PersonalInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
  github: string;
  bullets: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  url: string;
}

export interface ResumeSection {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  order: number;
}

export interface Resume {
  id: string;
  name: string;
  template: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  sections: ResumeSection[];
  createdAt: string;
  updatedAt: string;
}

interface ResumeStore {
  currentResume: Resume | null;
  resumes: Resume[];
  createResume: (name?: string) => Resume;
  updateResume: (updates: Partial<Resume>) => void;
  setCurrentResume: (resume: Resume | null) => void;
  deleteResume: (id: string) => void;
  loadResume: (data: any) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  addExperience: () => void;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  deleteEducation: (id: string) => void;
  addSkill: () => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addCertification: () => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;
  reorderSections: (sections: ResumeSection[]) => void;
  toggleSectionVisibility: (id: string) => void;
}

const createDefaultResume = (name: string = 'My Resume'): Resume => ({
  id: generateId(),
  name,
  template: 'classic',
  personalInfo: {
    id: generateId(),
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  sections: [
    { id: generateId(), type: 'personal', title: 'Personal Info', visible: true, order: 0 },
    { id: generateId(), type: 'summary', title: 'Summary', visible: true, order: 1 },
    { id: generateId(), type: 'experience', title: 'Experience', visible: true, order: 2 },
    { id: generateId(), type: 'education', title: 'Education', visible: true, order: 3 },
    { id: generateId(), type: 'skills', title: 'Skills', visible: true, order: 4 },
    { id: generateId(), type: 'projects', title: 'Projects', visible: true, order: 5 },
    { id: generateId(), type: 'certifications', title: 'Certifications', visible: true, order: 6 },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      currentResume: null,
      resumes: [],

      createResume: (name) => {
        const newResume = createDefaultResume(name);
        set((state) => ({
          resumes: [...state.resumes, newResume],
          currentResume: newResume,
        }));
        return newResume;
      },

      updateResume: (updates) => {
        set((state) => {
          if (!state.currentResume) return state;
          const updated = {
            ...state.currentResume,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return {
            currentResume: updated,
            resumes: state.resumes.map((r) => (r.id === updated.id ? updated : r)),
          };
        });
      },

      setCurrentResume: (resume) => set({ currentResume: resume }),

      deleteResume: (id) => {
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== id),
          currentResume: state.currentResume?.id === id ? null : state.currentResume,
        }));
      },

      loadResume: (data) => {
        const resume: Resume = {
          id: generateId(),
          name: 'Imported Resume',
          template: 'classic',
          personalInfo: {
            id: generateId(),
            firstName: data.personalInfo?.firstName || '',
            lastName: data.personalInfo?.lastName || '',
            email: data.personalInfo?.email || '',
            phone: data.personalInfo?.phone || '',
            location: data.personalInfo?.location || '',
            linkedIn: data.personalInfo?.linkedIn || '',
            github: data.personalInfo?.github || '',
            portfolio: data.personalInfo?.portfolio || '',
            summary: data.personalInfo?.summary || '',
          },
          experience: (data.experience || []).map((exp: any) => ({
            id: generateId(),
            company: exp.company || '',
            position: exp.position || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            current: exp.current || false,
            bullets: exp.bullets || [],
          })),
          education: (data.education || []).map((edu: any) => ({
            id: generateId(),
            institution: edu.institution || '',
            degree: edu.degree || '',
            field: edu.field || '',
            location: edu.location || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            gpa: edu.gpa || '',
          })),
          skills: (data.skills || []).map((skill: any) => ({
            id: generateId(),
            name: skill.name || '',
            category: skill.category || 'technical',
            level: skill.level || 'intermediate',
          })),
          projects: (data.projects || []).map((proj: any) => ({
            id: generateId(),
            name: proj.name || '',
            description: proj.description || '',
            technologies: proj.technologies || [],
            url: proj.url || '',
            github: proj.github || '',
            bullets: proj.bullets || [],
          })),
          certifications: (data.certifications || []).map((cert: any) => ({
            id: generateId(),
            name: cert.name || '',
            issuer: cert.issuer || '',
            issueDate: cert.issueDate || '',
            expiryDate: cert.expiryDate || '',
            credentialId: cert.credentialId || '',
            url: cert.url || '',
          })),
          sections: [
            { id: generateId(), type: 'personal', title: 'Personal Info', visible: true, order: 0 },
            { id: generateId(), type: 'summary', title: 'Summary', visible: true, order: 1 },
            { id: generateId(), type: 'experience', title: 'Experience', visible: true, order: 2 },
            { id: generateId(), type: 'education', title: 'Education', visible: true, order: 3 },
            { id: generateId(), type: 'skills', title: 'Skills', visible: true, order: 4 },
            { id: generateId(), type: 'projects', title: 'Projects', visible: true, order: 5 },
            { id: generateId(), type: 'certifications', title: 'Certifications', visible: true, order: 6 },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          resumes: [...state.resumes, resume],
          currentResume: resume,
        }));
      },

      updatePersonalInfo: (info) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          personalInfo: { ...currentResume.personalInfo, ...info },
        });
      },

      addExperience: () => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        const newExp: Experience = {
          id: generateId(),
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          bullets: [''],
        };
        updateResume({ experience: [...currentResume.experience, newExp] });
      },

      updateExperience: (id, updates) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          experience: currentResume.experience.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        });
      },

      deleteExperience: (id) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          experience: currentResume.experience.filter((e) => e.id !== id),
        });
      },

      addEducation: () => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        const newEdu: Education = {
          id: generateId(),
          institution: '',
          degree: '',
          field: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: '',
        };
        updateResume({ education: [...currentResume.education, newEdu] });
      },

      updateEducation: (id, updates) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          education: currentResume.education.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        });
      },

      deleteEducation: (id) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          education: currentResume.education.filter((e) => e.id !== id),
        });
      },

      addSkill: () => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        const newSkill: Skill = {
          id: generateId(),
          name: '',
          category: 'technical',
          level: 'intermediate',
        };
        updateResume({ skills: [...currentResume.skills, newSkill] });
      },

      updateSkill: (id, updates) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          skills: currentResume.skills.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        });
      },

      deleteSkill: (id) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          skills: currentResume.skills.filter((s) => s.id !== id),
        });
      },

      addProject: () => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        const newProject: Project = {
          id: generateId(),
          name: '',
          description: '',
          technologies: [],
          url: '',
          github: '',
          bullets: [''],
        };
        updateResume({ projects: [...currentResume.projects, newProject] });
      },

      updateProject: (id, updates) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          projects: currentResume.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        });
      },

      deleteProject: (id) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          projects: currentResume.projects.filter((p) => p.id !== id),
        });
      },

      addCertification: () => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        const newCert: Certification = {
          id: generateId(),
          name: '',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          url: '',
        };
        updateResume({ certifications: [...currentResume.certifications, newCert] });
      },

      updateCertification: (id, updates) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          certifications: currentResume.certifications.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
      },

      deleteCertification: (id) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          certifications: currentResume.certifications.filter((c) => c.id !== id),
        });
      },

      reorderSections: (sections) => {
        const { updateResume } = get();
        updateResume({ sections });
      },

      toggleSectionVisibility: (id) => {
        const { currentResume, updateResume } = get();
        if (!currentResume) return;
        updateResume({
          sections: currentResume.sections.map((s) =>
            s.id === id ? { ...s, visible: !s.visible } : s
          ),
        });
      },
    }),
    {
      name: 'ats-resume-storage',
    }
  )
);
