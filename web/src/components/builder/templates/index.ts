export { default as ClassicTemplate } from './ClassicTemplate';
export { default as ModernTemplate } from './ModernTemplate';
export { default as MinimalTemplate } from './MinimalTemplate';
export { default as ProfessionalTemplate } from './ProfessionalTemplate';
export { default as CreativeTemplate } from './CreativeTemplate';

export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional, ATS-friendly format with serif fonts',
    preview: '📄',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean design with blue accents and icons',
    preview: '💼',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant with lots of whitespace',
    preview: '✨',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Two-column layout with dark sidebar',
    preview: '🎯',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Colorful gradient design with cards',
    preview: '🎨',
  },
];
