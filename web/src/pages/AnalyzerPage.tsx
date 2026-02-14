import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, CheckCircle, XCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface ATSAnalysis {
  score: number;
  keywordMatches: { keyword: string; found: boolean; count: number; importance: string }[];
  missingKeywords: string[];
  sectionScores: { section: string; score: number; feedback: string }[];
  suggestions: { id: string; type: string; priority: string; section: string; message: string }[];
  formatIssues: { id: string; type: string; severity: string; message: string }[];
}

export default function AnalyzerPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.data);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">ATS Resume Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Compare your resume against a job description to see how well it matches
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Resume</CardTitle>
            <CardDescription>Paste your resume text here</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here..."
              rows={12}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>Paste the job description you're applying for</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={12}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={loading || !resumeText || !jobDescription}
        >
          <BarChart3 className="mr-2 h-5 w-5" />
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* Score Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <div className="text-xl font-semibold mt-2">{getScoreLabel(analysis.score)}</div>
                <Progress value={analysis.score} className="mt-4 h-3" />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="keywords">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
            </TabsList>

            <TabsContent value="keywords" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Analysis</CardTitle>
                  <CardDescription>
                    Keywords found in the job description and your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">
                        Matched Keywords ({analysis.keywordMatches.filter(k => k.found).length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordMatches
                          .filter((k) => k.found)
                          .map((k) => (
                            <span
                              key={k.keyword}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                            >
                              {k.keyword} ({k.count}x)
                            </span>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">
                        Missing Keywords ({analysis.missingKeywords.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Section Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.sectionScores.map((section) => (
                      <div key={section.section}>
                        <div className="flex justify-between mb-1">
                          <span className="capitalize font-medium">{section.section}</span>
                          <span className={getScoreColor(section.score)}>{section.score}%</span>
                        </div>
                        <Progress value={section.score} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-1">{section.feedback}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        {suggestion.priority === 'high' ? (
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">{suggestion.message}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {suggestion.section} • {suggestion.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="issues" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Format Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.formatIssues.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>No format issues detected!</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analysis.formatIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          {issue.severity === 'error' ? (
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{issue.message}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {issue.type} • {issue.severity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
