import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Sparkles, Download, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

export default function SmartAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadResume } = useResumeStore();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleAnalyzeAndFix = async () => {
    if (!file || !jobDescription) return;

    setLoading(true);
    setStep('analyzing');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const response = await api.fetch('/api/upload/auto-fix', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setStep('results');
      } else {
        alert(data.error?.message || 'Failed to analyze resume');
        setStep('upload');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to connect to server');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleUseOptimizedResume = () => {
    if (results?.structuredResume) {
      loadResume(results.structuredResume);
      navigate('/builder');
    }
  };

  const handleDownloadOptimized = () => {
    if (results?.optimizedText) {
      const blob = new Blob([results.optimizedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimized-resume.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Smart Resume Analyzer & Fixer</h1>
        <p className="text-muted-foreground mt-2">
          Upload your resume, and we'll analyze it against the job description and automatically optimize it for a perfect ATS score
        </p>
      </div>

      {step === 'upload' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Resume
              </CardTitle>
              <CardDescription>PDF, DOCX, or TXT format</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  file ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-muted-foreground/25 hover:border-primary'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p>Drag & drop your resume here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>Paste the job posting you're applying for</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                rows={10}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'upload' && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyzeAndFix}
            disabled={!file || !jobDescription}
            className="gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Analyze & Auto-Fix Resume
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {step === 'analyzing' && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
            <h2 className="text-2xl font-bold">Analyzing Your Resume...</h2>
            <p className="text-muted-foreground">
              Our AI is reading your resume, comparing it with the job description, and optimizing it for maximum ATS score.
            </p>
            <div className="max-w-md mx-auto space-y-2">
              <Progress value={33} className="h-2" />
              <p className="text-sm text-muted-foreground">This may take 30-60 seconds...</p>
            </div>
          </div>
        </Card>
      )}

      {step === 'results' && results && (
        <div className="space-y-6">
          {/* Score Comparison */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Original Score</p>
                  <div className={`text-5xl font-bold ${getScoreColor(results.initialScore)}`}>
                    {results.initialScore}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Optimized Score</p>
                  <div className={`text-5xl font-bold ${getScoreColor(results.finalScore)}`}>
                    {results.finalScore}
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                  +{results.improvements.scoreIncrease} points improvement
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Improvements Made */}
          <Card>
            <CardHeader>
              <CardTitle>Improvements Made</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Keywords Added ({results.improvements.keywordsAdded.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.improvements.keywordsAdded.map((keyword: string) => (
                      <span key={keyword} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm">
                        + {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {results.finalAnalysis.missingKeywords.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Still Missing (Consider adding manually)</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.finalAnalysis.missingKeywords.slice(0, 10).map((keyword: string) => (
                        <span key={keyword} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resume Comparison */}
          <Tabs defaultValue="optimized">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="optimized">Optimized Resume</TabsTrigger>
              <TabsTrigger value="original">Original Resume</TabsTrigger>
            </TabsList>
            <TabsContent value="optimized">
              <Card>
                <CardContent className="pt-6">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg max-h-96 overflow-auto">
                    {results.optimizedText}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="original">
              <Card>
                <CardContent className="pt-6">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg max-h-96 overflow-auto">
                    {results.originalText}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleUseOptimizedResume} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Use in Resume Builder
            </Button>
            <Button size="lg" variant="outline" onClick={handleDownloadOptimized} className="gap-2">
              <Download className="h-5 w-5" />
              Download Optimized Resume
            </Button>
            <Button size="lg" variant="ghost" onClick={() => { setStep('upload'); setResults(null); setFile(null); }}>
              Analyze Another Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
