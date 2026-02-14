import { useEffect, useRef, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Eye, Upload, Loader2, Palette, Printer } from 'lucide-react';
import PersonalInfoForm from '@/components/builder/PersonalInfoForm';
import ExperienceForm from '@/components/builder/ExperienceForm';
import EducationForm from '@/components/builder/EducationForm';
import SkillsForm from '@/components/builder/SkillsForm';
import ProjectsForm from '@/components/builder/ProjectsForm';
import CertificationsForm from '@/components/builder/CertificationsForm';
import ResumePreview from '@/components/builder/ResumePreview';
import SectionManager from '@/components/builder/SectionManager';
import { TEMPLATES } from '@/components/builder/templates';
import api from '@/lib/api';

export default function BuilderPage() {
  const { currentResume, createResume, loadResume, updateResume } = useResumeStore();
  const [uploading, setUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentResume) {
      createResume('My Resume');
    }
  }, [currentResume, createResume]);

  if (!currentResume) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    try {
      const response = await api.fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: currentResume }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentResume.name}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('resume-preview-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the resume');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentResume.name || 'Resume'}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.fetch('/api/upload/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.data.resume) {
        loadResume(data.data.resume);
        alert('Resume imported successfully! All fields have been filled.');
      } else {
        alert('Failed to parse resume. Please try again.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload resume.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          <div className="flex gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleUploadResume}
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              {uploading ? 'Importing...' : 'Import Resume'}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} title="Print/Save as PDF with template styling">
              <Printer className="h-4 w-4 mr-1" />
              Print PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('docx')}>
              <Download className="h-4 w-4 mr-1" />
              DOCX
            </Button>
          </div>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="certs">Certs</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <PersonalInfoForm />
          </TabsContent>

          <TabsContent value="experience" className="mt-4">
            <ExperienceForm />
          </TabsContent>

          <TabsContent value="education" className="mt-4">
            <EducationForm />
          </TabsContent>

          <TabsContent value="skills" className="mt-4">
            <SkillsForm />
          </TabsContent>

          <TabsContent value="projects" className="mt-4">
            <ProjectsForm />
          </TabsContent>

          <TabsContent value="certs" className="mt-4">
            <CertificationsForm />
          </TabsContent>
        </Tabs>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">Section Order</h3>
          <SectionManager />
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
        <Card className="h-full overflow-auto">
          <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Live Preview
            </h2>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  updateResume({ template: e.target.value });
                }}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.preview} {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Template Previews */}
          <div className="p-3 border-b bg-muted/30">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t.id);
                    updateResume({ template: t.id });
                  }}
                  className={`flex-shrink-0 p-2 rounded-lg border-2 transition-all ${
                    selectedTemplate === t.id
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="text-2xl mb-1">{t.preview}</div>
                  <div className="text-xs font-medium">{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4" id="resume-preview-content">
            <ResumePreview template={selectedTemplate} />
          </div>
        </Card>
      </div>
    </div>
  );
}
