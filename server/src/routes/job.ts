import { Router, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/sqlite';
import { ApiError } from '../middleware/errorHandler';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { ATSAnalyzer } from '../services/atsAnalyzer';

const router = Router();
const atsAnalyzer = new ATSAnalyzer();

// Extract job description from text/HTML
router.post('/extract', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text, html, url, source } = req.body;

    if (!text && !html) {
      throw ApiError.badRequest('Text or HTML content is required');
    }

    let content = text;
    
    // If HTML provided, extract text
    if (html && !text) {
      content = extractTextFromHtml(html);
    }

    // Extract job details
    const jobDetails = parseJobDescription(content);
    const keywords = atsAnalyzer.extractKeywords(content);

    const jobDescription = {
      id: uuidv4(),
      title: jobDetails.title || 'Untitled Position',
      company: jobDetails.company || 'Unknown Company',
      description: content,
      requirements: jobDetails.requirements,
      keywords,
      source: source || 'manual',
      url: url || null,
      extractedAt: new Date().toISOString(),
    };

    // Save if user is authenticated
    if (req.userId) {
      const db = getDb();
      db.prepare(`
        INSERT INTO job_descriptions (id, user_id, title, company, description, keywords, source, url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        jobDescription.id,
        req.userId,
        jobDescription.title,
        jobDescription.company,
        jobDescription.description,
        JSON.stringify(keywords),
        jobDescription.source,
        jobDescription.url,
        jobDescription.extractedAt
      );
    }

    res.json({
      success: true,
      data: jobDescription,
    });
  } catch (error) {
    next(error);
  }
});

// Save job description
router.post('/save', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, company, description, source, url } = req.body;

    if (!description) {
      throw ApiError.badRequest('Job description is required');
    }

    const keywords = atsAnalyzer.extractKeywords(description);
    const id = uuidv4();
    const now = new Date().toISOString();

    if (req.userId) {
      const db = getDb();
      db.prepare(`
        INSERT INTO job_descriptions (id, user_id, title, company, description, keywords, source, url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, req.userId, title || 'Untitled', company || '', description, JSON.stringify(keywords), source || 'manual', url || null, now);
    }

    res.json({
      success: true,
      data: {
        id,
        title: title || 'Untitled',
        company: company || '',
        description,
        keywords,
        source: source || 'manual',
        url,
        createdAt: now,
      },
    });
  } catch (error) {
    next(error);
  }
});

// List saved job descriptions
router.get('/list', optionalAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.json({ success: true, data: [], total: 0 });
    }

    const db = getDb();
    const jobs = db.prepare(`
      SELECT * FROM job_descriptions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.userId);

    const parsed = jobs.map((j: any) => ({
      ...j,
      keywords: JSON.parse(j.keywords || '[]'),
    }));

    res.json({
      success: true,
      data: parsed,
      total: parsed.length,
    });
  } catch (error) {
    next(error);
  }
});

// Delete job description
router.delete('/:id', optionalAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const db = getDb();

    db.prepare('DELETE FROM job_descriptions WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Job description deleted',
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseJobDescription(text: string): {
  title: string | null;
  company: string | null;
  requirements: string[];
} {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let title: string | null = null;
  let company: string | null = null;
  const requirements: string[] = [];

  // Try to find title (usually first meaningful line or after "Job Title:")
  const titleMatch = text.match(/(?:job title|position|role)[:\s]*([^\n]+)/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  } else if (lines.length > 0) {
    title = lines[0].substring(0, 100);
  }

  // Try to find company
  const companyMatch = text.match(/(?:company|employer|organization)[:\s]*([^\n]+)/i);
  if (companyMatch) {
    company = companyMatch[1].trim();
  }

  // Extract requirements (lines starting with bullets or in requirements section)
  const reqSection = text.match(/(?:requirements|qualifications|must have)[:\s]*([^]*?)(?=\n\n|responsibilities|benefits|$)/i);
  if (reqSection) {
    const reqLines = reqSection[1].split('\n')
      .map(l => l.trim())
      .filter(l => l.match(/^[•\-\*\d\.]/))
      .map(l => l.replace(/^[•\-\*\d\.]\s*/, ''));
    requirements.push(...reqLines);
  }

  return { title, company, requirements };
}

export default router;
