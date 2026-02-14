// AI Service - OpenAI/Claude/Grok Integration for Resume Optimization

import OpenAI from 'openai';

interface AIConfig {
  provider: 'openai' | 'anthropic' | 'grok' | 'groq';
  apiKey: string;
}

interface GenerateBulletsRequest {
  position: string;
  company: string;
  responsibilities: string;
  keywords?: string[];
}

interface RewriteRequest {
  content: string;
  targetKeywords: string[];
  tone?: 'professional' | 'casual' | 'technical';
}

interface OptimizeRequest {
  resumeText: string;
  jobDescription: string;
  sections?: string[];
}

// Prompt Templates
const PROMPT_TEMPLATES = {
  GENERATE_BULLETS: `You are an expert resume writer specializing in ATS-optimized content.

Generate 4-5 impactful bullet points for the following work experience:

Position: {{position}}
Company: {{company}}
Responsibilities: {{responsibilities}}
{{#keywords}}Target Keywords to include: {{keywords}}{{/keywords}}

Requirements:
1. Start each bullet with a strong action verb
2. Include quantifiable achievements where possible (%, $, numbers)
3. Keep each bullet under 100 characters
4. Make them ATS-friendly (avoid special characters, tables)
5. Naturally incorporate relevant keywords

Return ONLY the bullet points, one per line, starting with •`,

  REWRITE_FOR_ATS: `You are an ATS optimization expert. Rewrite the following resume content to be more ATS-friendly while maintaining professionalism.

Original Content:
{{content}}

Target Keywords to incorporate: {{keywords}}

Tone: {{tone}}

Requirements:
1. Maintain the original meaning and facts
2. Naturally incorporate the target keywords
3. Use industry-standard terminology
4. Avoid graphics, tables, special characters
5. Use clear section headers
6. Keep formatting simple and clean

Return the optimized content:`,

  OPTIMIZE_RESUME: `You are a professional resume consultant. Analyze and optimize this resume for the given job description.

Resume:
{{resumeText}}

Job Description:
{{jobDescription}}

Provide specific improvements for:
1. Missing keywords that should be added
2. Bullet points that need strengthening
3. Skills that should be highlighted
4. Format improvements for ATS compatibility

Format your response as JSON:
{
  "missingKeywords": ["keyword1", "keyword2"],
  "bulletImprovements": [{"original": "...", "improved": "..."}],
  "skillsToAdd": ["skill1", "skill2"],
  "formatSuggestions": ["suggestion1", "suggestion2"],
  "overallFeedback": "..."
}`,

  IMPROVE_GRAMMAR: `You are a professional editor. Improve the grammar, clarity, and impact of the following text while maintaining its meaning.

Text:
{{content}}

Requirements:
1. Fix any grammatical errors
2. Improve sentence structure
3. Make the language more impactful
4. Keep the professional tone
5. Do not change factual content

Return only the improved text:`,

  SUGGEST_KEYWORDS: `Analyze this job description and extract the most important keywords for an ATS-optimized resume.

Job Description:
{{jobDescription}}

Return a JSON object with:
{
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "certifications": ["cert1", "cert2"],
  "tools": ["tool1", "tool2"],
  "actionVerbs": ["verb1", "verb2"],
  "industryTerms": ["term1", "term2"]
}`,
};

export class AIService {
  private openai: OpenAI | null = null;
  private grok: OpenAI | null = null;
  private groq: OpenAI | null = null;
  private provider: 'openai' | 'anthropic' | 'grok' | 'groq';

  constructor() {
    this.provider = (process.env.AI_PROVIDER as 'openai' | 'anthropic' | 'grok' | 'groq') || 'openai';
    
    console.log('AI Service initializing...');
    console.log('Provider:', this.provider);
    console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('OpenAI configured');
    }

    // Grok API (X.AI) uses OpenAI-compatible endpoint
    if (process.env.GROK_API_KEY && process.env.GROK_API_KEY.length > 0) {
      this.grok = new OpenAI({
        apiKey: process.env.GROK_API_KEY,
        baseURL: 'https://api.x.ai/v1',
      });
      console.log('Grok configured');
    }

    // Groq API uses OpenAI-compatible endpoint
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 0) {
      this.groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      console.log('Groq configured');
    }
  }

  private fillTemplate(template: string, data: Record<string, string | string[] | undefined>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value.join(', '));
        // Handle conditional sections
        if (value.length > 0) {
          result = result.replace(new RegExp(`{{#${key}}}([^]*?){{/${key}}}`, 'g'), '$1');
        } else {
          result = result.replace(new RegExp(`{{#${key}}}([^]*?){{/${key}}}`, 'g'), '');
        }
      } else if (value !== undefined) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }
    
    return result;
  }

  async generateBullets(request: GenerateBulletsRequest): Promise<string[]> {
    const prompt = this.fillTemplate(PROMPT_TEMPLATES.GENERATE_BULLETS, {
      position: request.position,
      company: request.company,
      responsibilities: request.responsibilities,
      keywords: request.keywords,
    });

    const response = await this.callAI(prompt);
    
    return response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('•') || line.startsWith('-'))
      .map(line => line.replace(/^[•\-]\s*/, ''));
  }

  async rewriteForATS(request: RewriteRequest): Promise<string> {
    const prompt = this.fillTemplate(PROMPT_TEMPLATES.REWRITE_FOR_ATS, {
      content: request.content,
      keywords: request.targetKeywords,
      tone: request.tone || 'professional',
    });

    return await this.callAI(prompt);
  }

  async optimizeResume(request: OptimizeRequest): Promise<{
    missingKeywords: string[];
    bulletImprovements: { original: string; improved: string }[];
    skillsToAdd: string[];
    formatSuggestions: string[];
    overallFeedback: string;
  }> {
    const prompt = this.fillTemplate(PROMPT_TEMPLATES.OPTIMIZE_RESUME, {
      resumeText: request.resumeText,
      jobDescription: request.jobDescription,
    });

    const response = await this.callAI(prompt);
    
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }

    return {
      missingKeywords: [],
      bulletImprovements: [],
      skillsToAdd: [],
      formatSuggestions: [],
      overallFeedback: response,
    };
  }

  async improveGrammar(content: string): Promise<string> {
    const prompt = this.fillTemplate(PROMPT_TEMPLATES.IMPROVE_GRAMMAR, {
      content,
    });

    return await this.callAI(prompt);
  }

  async suggestKeywords(jobDescription: string): Promise<{
    technicalSkills: string[];
    softSkills: string[];
    certifications: string[];
    tools: string[];
    actionVerbs: string[];
    industryTerms: string[];
  }> {
    const prompt = this.fillTemplate(PROMPT_TEMPLATES.SUGGEST_KEYWORDS, {
      jobDescription,
    });

    const response = await this.callAI(prompt);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }

    return {
      technicalSkills: [],
      softSkills: [],
      certifications: [],
      tools: [],
      actionVerbs: [],
      industryTerms: [],
    };
  }

  // Public method for external use
  async callAIPublic(prompt: string): Promise<string> {
    return this.callAI(prompt);
  }

  private async callAI(prompt: string): Promise<string> {
    // Try Groq first if configured
    if (this.provider === 'groq' && this.groq) {
      try {
        const completion = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume writer and ATS optimization specialist.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        return completion.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to get AI response from Groq');
      }
    }

    // Try Grok (X.AI) if configured
    if (this.provider === 'grok' && this.grok) {
      try {
        const completion = await this.grok.chat.completions.create({
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume writer and ATS optimization specialist.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });

        return completion.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('Grok API error:', error);
        throw new Error('Failed to get AI response from Grok');
      }
    }

    // Use OpenAI
    if (!this.openai) {
      throw new Error('AI service not configured. Please set OPENAI_API_KEY, GROK_API_KEY, or GROQ_API_KEY.');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer and ATS optimization specialist.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI API error:', error);
      throw new Error('Failed to get AI response');
    }
  }
}

export const aiService = new AIService();
