import { Link } from 'react-router-dom';
import { FileText, BarChart3, CheckCircle, Upload, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Upload,
    title: 'Smart Analyzer & Auto-Fix',
    description: 'Upload your resume, get ATS score, and auto-fix it to score 100%',
    link: '/smart-analyzer',
    highlight: true,
  },
  {
    icon: Wand2,
    title: 'AI Resume Generator',
    description: 'Enter basic info + job description, get a complete ATS-optimized resume',
    link: '/generate',
    highlight: true,
  },
  {
    icon: FileText,
    title: 'Resume Builder',
    description: 'Create professional resumes with our intuitive drag-and-drop builder',
    link: '/builder',
  },
  {
    icon: BarChart3,
    title: 'ATS Analyzer',
    description: 'Score your resume against job descriptions and get improvement suggestions',
    link: '/analyzer',
  },
];

const benefits = [
  'ATS-friendly templates that pass automated screening',
  'Real-time keyword matching with job descriptions',
  'AI-powered bullet point generation',
  'Section reordering with drag and drop',
  'Dark and light mode support',
  'Local storage - no account required',
];

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Build ATS-Friendly Resumes
          <span className="text-primary block mt-2">That Get You Hired</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create, analyze, and optimize your resume to pass Applicant Tracking Systems 
          and land more interviews.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/builder">
            <Button size="lg" className="w-full sm:w-auto">
              <FileText className="mr-2 h-5 w-5" />
              Start Building
            </Button>
          </Link>
          <Link to="/analyzer">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <BarChart3 className="mr-2 h-5 w-5" />
              Analyze Resume
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Everything You Need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.link || '#'}>
              <Card className={`text-center h-full transition-all hover:shadow-lg hover:-translate-y-1 ${feature.highlight ? 'border-primary border-2 bg-primary/5' : ''}`}>
                <CardHeader>
                  <feature.icon className={`h-12 w-12 mx-auto ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  {feature.highlight && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">NEW</span>}
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 rounded-lg p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Our Builder?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 py-8">
        <h2 className="text-3xl font-bold">Ready to Land Your Dream Job?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Join thousands of job seekers who have improved their resumes and increased 
          their interview callbacks.
        </p>
        <Link to="/builder">
          <Button size="lg">
            Create Your Resume Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
