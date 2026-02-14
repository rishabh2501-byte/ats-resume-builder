import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

const skillCategories = [
  { value: 'technical', label: 'Technical' },
  { value: 'soft', label: 'Soft Skills' },
  { value: 'language', label: 'Languages' },
  { value: 'tool', label: 'Tools' },
  { value: 'framework', label: 'Frameworks' },
  { value: 'other', label: 'Other' },
];

const skillLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export default function SkillsForm() {
  const { currentResume, addSkill, updateSkill, deleteSkill } = useResumeStore();

  if (!currentResume) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {currentResume.skills.map((skill) => (
              <div key={skill.id} className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Skill Name</Label>
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                    placeholder="e.g., JavaScript, Project Management"
                  />
                </div>
                <div className="w-32 space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={skill.category}
                    onValueChange={(value) => updateSkill(skill.id, { category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32 space-y-1">
                  <Label className="text-xs">Level</Label>
                  <Select
                    value={skill.level}
                    onValueChange={(value) => updateSkill(skill.id, { level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSkill(skill.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={addSkill} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Skill
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Tip: Add skills that match keywords in job descriptions for better ATS scores
      </p>
    </div>
  );
}
