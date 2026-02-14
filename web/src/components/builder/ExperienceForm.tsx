import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function ExperienceForm() {
  const { currentResume, addExperience, updateExperience, deleteExperience } = useResumeStore();
  const [generating, setGenerating] = useState<string | null>(null);

  if (!currentResume) return null;

  const handleAddBullet = (expId: string, bullets: string[]) => {
    updateExperience(expId, { bullets: [...bullets, ''] });
  };

  const handleUpdateBullet = (expId: string, bullets: string[], index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    updateExperience(expId, { bullets: newBullets });
  };

  const handleRemoveBullet = (expId: string, bullets: string[], index: number) => {
    updateExperience(expId, { bullets: bullets.filter((_, i) => i !== index) });
  };

  const handleGenerateBullets = async (expId: string, position: string, company: string) => {
    setGenerating(expId);
    try {
      const response = await fetch('/api/ai/generate-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position,
          company,
          responsibilities: 'General responsibilities for this role',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.bullets) {
          updateExperience(expId, { bullets: data.data.bullets });
        }
      }
    } catch (error) {
      console.error('Failed to generate bullets:', error);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-4">
      {currentResume.experience.map((exp, index) => (
        <Card key={exp.id}>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-lg">Experience {index + 1}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteExperience(exp.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                  placeholder="Tech Company Inc."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={exp.location}
                  onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                  placeholder="New York, NY"
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                  disabled={exp.current}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={exp.current}
                onCheckedChange={(checked) => updateExperience(exp.id, { current: checked })}
              />
              <Label>Currently working here</Label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Bullet Points</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateBullets(exp.id, exp.position, exp.company)}
                  disabled={generating === exp.id || !exp.position}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {generating === exp.id ? 'Generating...' : 'AI Generate'}
                </Button>
              </div>
              {exp.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex gap-2">
                  <Input
                    value={bullet}
                    onChange={(e) => handleUpdateBullet(exp.id, exp.bullets, bulletIndex, e.target.value)}
                    placeholder="Describe your achievement or responsibility..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBullet(exp.id, exp.bullets, bulletIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBullet(exp.id, exp.bullets)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Bullet
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addExperience} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );
}
