import { Router, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/sqlite';
import { ApiError } from '../middleware/errorHandler';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { ATSAnalyzer } from '../services/atsAnalyzer';

const router = Router();
const atsAnalyzer = new ATSAnalyzer();

// Analyze resume against job description
router.post('/analyze', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeText, jobDescription, resumeId, jobId } = req.body;

    if (!resumeText || !jobDescription) {
      throw ApiError.badRequest('Resume text and job description are required');
    }

    const analysis = atsAnalyzer.analyze(resumeText, jobDescription);

    // Save analysis if user is authenticated
    if (req.userId && resumeId) {
      const db = getDb();
      const id = uuidv4();
      db.prepare(`
        INSERT INTO ats_analyses (id, resume_id, job_id, score, analysis, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, resumeId, jobId || null, analysis.score, JSON.stringify(analysis), new Date().toISOString());
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
});

// Quick score (lighter analysis)
router.post('/score', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      throw ApiError.badRequest('Resume text and job description are required');
    }

    const score = atsAnalyzer.quickScore(resumeText, jobDescription);

    res.json({
      success: true,
      data: { score },
    });
  } catch (error) {
    next(error);
  }
});

// Extract keywords from job description
router.post('/keywords', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;

    if (!text) {
      throw ApiError.badRequest('Text is required');
    }

    const keywords = atsAnalyzer.extractKeywords(text);

    res.json({
      success: true,
      data: { keywords },
    });
  } catch (error) {
    next(error);
  }
});

// Get analysis history
router.get('/history', optionalAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.json({ success: true, data: [] });
    }

    const db = getDb();
    const analyses = db.prepare(`
      SELECT a.*, r.name as resume_name
      FROM ats_analyses a
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE r.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 20
    `).all(req.userId);

    const parsed = analyses.map((a: any) => ({
      ...a,
      analysis: JSON.parse(a.analysis),
    }));

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
