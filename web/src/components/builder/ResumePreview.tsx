import { useResumeStore } from '@/store/resumeStore';
import { ClassicTemplate, ModernTemplate, MinimalTemplate, ProfessionalTemplate, CreativeTemplate } from './templates';

interface ResumePreviewProps {
  template?: string;
}

export default function ResumePreview({ template }: ResumePreviewProps) {
  const { currentResume } = useResumeStore();

  if (!currentResume) return null;

  const selectedTemplate = template || currentResume.template || 'classic';

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate resume={currentResume} />;
      case 'minimal':
        return <MinimalTemplate resume={currentResume} />;
      case 'professional':
        return <ProfessionalTemplate resume={currentResume} />;
      case 'creative':
        return <CreativeTemplate resume={currentResume} />;
      case 'classic':
      default:
        return <ClassicTemplate resume={currentResume} />;
    }
  };

  return (
    <div className="shadow-inner rounded overflow-hidden">
      {renderTemplate()}
    </div>
  );
}
