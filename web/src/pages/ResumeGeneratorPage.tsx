import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { useNavigate } from 'react-router-dom';

interface BasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  github: string;
  currentRole: string;
  yearsExperience: string;
  education: string;
  topSkills: string;
  previousCompanies: string;
}

export default function ResumeGeneratorPage() {
  const [step, setStep] = useState<'info' | 'generating' | 'results'>('info');
  const [jobDescription, setJobDescription] = useState('');
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    github: '',
    currentRole: '',
    yearsExperience: '',
    education: '',
    topSkills: '',
    previousCompanies: '',
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { loadResume } = useResumeStore();
  const navigate = useNavigate();

  const updateInfo = (field: keyof BasicInfo, value: string) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!jobDescription || !basicInfo.firstName) return;

    setLoading(true);
    setStep('generating');

    try {
      const response = await fetch('/api/upload/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basicInfo, jobDescription }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setStep('results');
      } else {
        alert(data.error?.message || 'Failed to generate resume');
        setStep('info');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to connect to server');
      setStep('info');
    } finally {
      setLoading(false);
    }
  };

  const handleUseResume = () => {
    if (results?.resume) {
      loadResume(results.resume);
      navigate('/builder');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">AI Resume Generator</h1>
        <p className="text-muted-foreground mt-2">
          Enter your basic information and the job description - we'll create a complete, ATS-optimized resume for you
        </p>
      </div>

      {step === 'info' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Tell us about yourself - we'll expand this into a full resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={basicInfo.firstName}
                    onChange={(e) => updateInfo('firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={basicInfo.lastName}
                    onChange={(e) => updateInfo('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={basicInfo.email}
                    onChange={(e) => updateInfo('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={basicInfo.phone}
                    onChange={(e) => updateInfo('phone', e.target.value)}
                    placeholder="+1 555-123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={basicInfo.location}
                  onChange={(e) => updateInfo('location', e.target.value)}
                  placeholder="New York, NY"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={basicInfo.linkedIn}
                    onChange={(e) => updateInfo('linkedIn', e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  <Input
                    value={basicInfo.github}
                    onChange={(e) => updateInfo('github', e.target.value)}
                    placeholder="github.com/johndoe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current/Recent Role *</Label>
                  <Input
                    value={basicInfo.currentRole}
                    onChange={(e) => updateInfo('currentRole', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience *</Label>
                  <Input
                    value={basicInfo.yearsExperience}
                    onChange={(e) => updateInfo('yearsExperience', e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Education</Label>
                <Input
                  value={basicInfo.education}
                  onChange={(e) => updateInfo('education', e.target.value)}
                  placeholder="BS Computer Science, MIT, 2018"
                />
              </div>

              <div className="space-y-2">
                <Label>Top Skills (comma-separated) *</Label>
                <Input
                  value={basicInfo.topSkills}
                  onChange={(e) => updateInfo('topSkills', e.target.value)}
                  placeholder="JavaScript, React, Node.js, Python, AWS"
                />
              </div>

              <div className="space-y-2">
                <Label>Previous Companies (comma-separated)</Label>
                <Input
                  value={basicInfo.previousCompanies}
                  onChange={(e) => updateInfo('previousCompanies', e.target.value)}
                  placeholder="Google, Microsoft, Startup XYZ"
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Target Job Description *</CardTitle>
              <CardDescription>Paste the job you're applying for - we'll tailor your resume to match</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here...

Example:
We are looking for a Senior Software Engineer with:
- 5+ years of experience in JavaScript/TypeScript
- Strong React and Node.js skills
- Experience with AWS or cloud platforms
- Excellent communication skills
..."
                rows={20}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'info' && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!basicInfo.firstName || !basicInfo.currentRole || !basicInfo.topSkills || !jobDescription}
            className="gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Generate ATS-Optimized Resume
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {step === 'generating' && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
            <h2 className="text-2xl font-bold">Generating Your Resume...</h2>
            <p className="text-muted-foreground">
              Our AI is creating a complete, professional resume tailored to the job description with all the right keywords.
            </p>
            <div className="max-w-md mx-auto space-y-2">
              <Progress value={50} className="h-2" />
              <p className="text-sm text-muted-foreground">This may take 30-60 seconds...</p>
            </div>
          </div>
        </Card>
      )}

      {step === 'results' && results && (
        <div className="space-y-6">
          {/* Score Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">ATS Score</p>
                  <div className={`text-6xl font-bold ${getScoreColor(results.analysis.score)}`}>
                    {results.analysis.score}
                  </div>
                </div>
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Optimized for target job</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>All key sections included</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>{results.keywords.length} keywords matched</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keywords Matched */}
          <Card>
            <CardHeader>
              <CardTitle>Keywords Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {results.keywords.slice(0, 20).map((keyword: string) => (
                  <span key={keyword} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm">
                    ✓ {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generated Resume Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Resume Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border max-h-[500px] overflow-auto">
                {/* Personal Info */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">
                    {results.resume.personalInfo.firstName} {results.resume.personalInfo.lastName}
                  </h1>
                  <p className="text-muted-foreground">
                    {results.resume.personalInfo.email} | {results.resume.personalInfo.phone} | {results.resume.personalInfo.location}
                  </p>
                </div>

                {/* Summary */}
                {results.resume.personalInfo.summary && (
                  <div className="mb-4">
                    <h2 className="font-bold border-b pb-1 mb-2">Professional Summary</h2>
                    <p className="text-sm">{results.resume.personalInfo.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {results.resume.experience?.length > 0 && (
                  <div className="mb-4">
                    <h2 className="font-bold border-b pb-1 mb-2">Experience</h2>
                    {results.resume.experience.map((exp: any, i: number) => (
                      <div key={i} className="mb-3">
                        <div className="flex justify-between">
                          <strong>{exp.position}</strong>
                          <span className="text-sm text-muted-foreground">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {exp.bullets?.map((bullet: string, j: number) => (
                            <li key={j}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {results.resume.skills?.length > 0 && (
                  <div className="mb-4">
                    <h2 className="font-bold border-b pb-1 mb-2">Skills</h2>
                    <p className="text-sm">{results.resume.skills.map((s: any) => s.name).join(', ')}</p>
                  </div>
                )}

                {/* Education */}
                {results.resume.education?.length > 0 && (
                  <div className="mb-4">
                    <h2 className="font-bold border-b pb-1 mb-2">Education</h2>
                    {results.resume.education.map((edu: any, i: number) => (
                      <div key={i}>
                        <strong>{edu.degree} in {edu.field}</strong>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleUseResume} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Edit in Resume Builder
            </Button>
            <Button size="lg" variant="ghost" onClick={() => { setStep('info'); setResults(null); }}>
              Generate Another Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
