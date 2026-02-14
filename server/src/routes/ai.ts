import { Router, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();

// Generate bullet points for experience
router.post('/generate-bullets', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { position, company, responsibilities, keywords } = req.body;

    if (!position || !company || !responsibilities) {
      throw ApiError.badRequest('Position, company, and responsibilities are required');
    }

    const bullets = await aiService.generateBullets({
      position,
      company,
      responsibilities,
      keywords,
    });

    res.json({
      success: true,
      data: { bullets },
    });
  } catch (error) {
    next(error);
  }
});

// Rewrite content for ATS optimization
router.post('/rewrite', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, targetKeywords, tone } = req.body;

    if (!content) {
      throw ApiError.badRequest('Content is required');
    }

    const rewritten = await aiService.rewriteForATS({
      content,
      targetKeywords: targetKeywords || [],
      tone,
    });

    res.json({
      success: true,
      data: { content: rewritten },
    });
  } catch (error) {
    next(error);
  }
});

// Full resume optimization
router.post('/optimize', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeText, jobDescription, sections } = req.body;

    if (!resumeText || !jobDescription) {
      throw ApiError.badRequest('Resume text and job description are required');
    }

    const optimization = await aiService.optimizeResume({
      resumeText,
      jobDescription,
      sections,
    });

    res.json({
      success: true,
      data: optimization,
    });
  } catch (error) {
    next(error);
  }
});

// Improve grammar
router.post('/improve-grammar', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;

    if (!content) {
      throw ApiError.badRequest('Content is required');
    }

    const improved = await aiService.improveGrammar(content);

    res.json({
      success: true,
      data: { content: improved },
    });
  } catch (error) {
    next(error);
  }
});

// Suggest keywords from job description
router.post('/suggest-keywords', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      throw ApiError.badRequest('Job description is required');
    }

    const keywords = await aiService.suggestKeywords(jobDescription);

    res.json({
      success: true,
      data: keywords,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
