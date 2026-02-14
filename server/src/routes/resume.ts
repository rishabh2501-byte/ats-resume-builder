import { Router, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/sqlite';
import { ApiError } from '../middleware/errorHandler';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all resumes for user
router.get('/', optionalAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDb();
    const userId = req.userId;

    let resumes;
    if (userId) {
      resumes = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC')
        .all(userId);
    } else {
      resumes = [];
    }

    const parsed = resumes.map((r: any) => ({
      ...r,
      data: JSON.parse(r.data),
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

// Get single resume
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const resume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(id) as any;

    if (!resume) {
      throw ApiError.notFound('Resume not found');
    }

    res.json({
      success: true,
      data: {
        ...resume,
        data: JSON.parse(resume.data),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create resume
router.post('/', optionalAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, template, data } = req.body;
    const db = getDb();

    const id = uuidv4();
    const now = new Date().toISOString();

    const defaultData = {
      personalInfo: {
        id: uuidv4(),
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        linkedIn: '',
        github: '',
        portfolio: '',
        summary: '',
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      sections: [
        { id: uuidv4(), type: 'personal', title: 'Personal Info', visible: true, order: 0 },
        { id: uuidv4(), type: 'summary', title: 'Summary', visible: true, order: 1 },
        { id: uuidv4(), type: 'experience', title: 'Experience', visible: true, order: 2 },
        { id: uuidv4(), type: 'education', title: 'Education', visible: true, order: 3 },
        { id: uuidv4(), type: 'skills', title: 'Skills', visible: true, order: 4 },
        { id: uuidv4(), type: 'projects', title: 'Projects', visible: true, order: 5 },
        { id: uuidv4(), type: 'certifications', title: 'Certifications', visible: true, order: 6 },
      ],
    };

    const resumeData = data || defaultData;

    db.prepare(`
      INSERT INTO resumes (id, user_id, name, template, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.userId || null, name || 'Untitled Resume', template || 'classic', JSON.stringify(resumeData), now, now);

    res.status(201).json({
      success: true,
      data: {
        id,
        user_id: req.userId,
        name: name || 'Untitled Resume',
        template: template || 'classic',
        data: resumeData,
        created_at: now,
        updated_at: now,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update resume
router.put('/:id', optionalAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, template, data } = req.body;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM resumes WHERE id = ?').get(id) as any;

    if (!existing) {
      throw ApiError.notFound('Resume not found');
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (template !== undefined) {
      updates.push('template = ?');
      values.push(template);
    }
    if (data !== undefined) {
      updates.push('data = ?');
      values.push(JSON.stringify(data));
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    db.prepare(`UPDATE resumes SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM resumes WHERE id = ?').get(id) as any;

    res.json({
      success: true,
      data: {
        ...updated,
        data: JSON.parse(updated.data),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete resume
router.delete('/:id', optionalAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM resumes WHERE id = ?').get(id);

    if (!existing) {
      throw ApiError.notFound('Resume not found');
    }

    db.prepare('DELETE FROM resumes WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Duplicate resume
router.post('/:id/duplicate', optionalAuth, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM resumes WHERE id = ?').get(id) as any;

    if (!existing) {
      throw ApiError.notFound('Resume not found');
    }

    const newId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO resumes (id, user_id, name, template, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newId, req.userId || null, `${existing.name} (Copy)`, existing.template, existing.data, now, now);

    const newResume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(newId) as any;

    res.status(201).json({
      success: true,
      data: {
        ...newResume,
        data: JSON.parse(newResume.data),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
