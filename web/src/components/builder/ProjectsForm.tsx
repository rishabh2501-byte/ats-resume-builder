import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export default function ProjectsForm() {
  const { currentResume, addProject, updateProject, deleteProject } = useResumeStore();

  if (!currentResume) return null;

  const handleAddBullet = (projId: string, bullets: string[]) => {
    updateProject(projId, { bullets: [...bullets, ''] });
  };

  const handleUpdateBullet = (projId: string, bullets: string[], index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    updateProject(projId, { bullets: newBullets });
  };

  const handleRemoveBullet = (projId: string, bullets: string[], index: number) => {
    updateProject(projId, { bullets: bullets.filter((_, i) => i !== index) });
  };

  const handleTechChange = (projId: string, value: string) => {
    const technologies = value.split(',').map((t) => t.trim()).filter(Boolean);
    updateProject(projId, { technologies });
  };

  return (
    <div className="space-y-4">
      {currentResume.projects.map((proj, index) => (
        <Card key={proj.id}>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-lg">Project {index + 1}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteProject(proj.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={proj.name}
                onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                placeholder="My Awesome Project"
              />
            </div>

            <div className="space-y-2">
              <Label>Technologies (comma-separated)</Label>
              <Input
                value={proj.technologies.join(', ')}
                onChange={(e) => handleTechChange(proj.id, e.target.value)}
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project URL</Label>
                <Input
                  value={proj.url}
                  onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                  placeholder="https://myproject.com"
                />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input
                  value={proj.github}
                  onChange={(e) => updateProject(proj.id, { github: e.target.value })}
                  placeholder="https://github.com/user/project"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description / Bullet Points</Label>
              {proj.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex gap-2">
                  <Input
                    value={bullet}
                    onChange={(e) => handleUpdateBullet(proj.id, proj.bullets, bulletIndex, e.target.value)}
                    placeholder="Describe what you built or achieved..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBullet(proj.id, proj.bullets, bulletIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBullet(proj.id, proj.bullets)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Bullet
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addProject} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </Button>
    </div>
  );
}
