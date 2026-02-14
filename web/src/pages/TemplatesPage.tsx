import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const templates = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional format, perfect for corporate roles',
    features: ['Clean layout', 'Professional fonts', 'ATS optimized'],
    preview: 'bg-gradient-to-b from-slate-100 to-slate-200',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with subtle accents',
    features: ['Modern typography', 'Accent colors', 'Section highlights'],
    preview: 'bg-gradient-to-b from-blue-50 to-blue-100',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and clean, lets your content shine',
    features: ['Maximum whitespace', 'Simple structure', 'Easy to scan'],
    preview: 'bg-gradient-to-b from-gray-50 to-gray-100',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Executive style for senior positions',
    features: ['Bold headers', 'Structured sections', 'Impactful layout'],
    preview: 'bg-gradient-to-b from-zinc-100 to-zinc-200',
  },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Resume Templates</h1>
        <p className="text-muted-foreground mt-2">
          Choose an ATS-friendly template to get started
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <div className={`h-40 ${template.preview}`}>
              <div className="p-4 space-y-2">
                <div className="h-3 w-24 bg-gray-400/30 rounded mx-auto" />
                <div className="h-2 w-32 bg-gray-400/20 rounded mx-auto" />
                <div className="mt-4 space-y-1">
                  <div className="h-2 w-full bg-gray-400/20 rounded" />
                  <div className="h-2 w-3/4 bg-gray-400/20 rounded" />
                  <div className="h-2 w-5/6 bg-gray-400/20 rounded" />
                </div>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 mb-4">
                {template.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to={`/builder?template=${template.id}`}>
                <Button className="w-full">Use Template</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">All Templates Are ATS-Optimized</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Every template is designed to pass Applicant Tracking Systems. We avoid graphics, 
          tables, and special characters that can confuse ATS parsers.
        </p>
      </div>
    </div>
  );
}
