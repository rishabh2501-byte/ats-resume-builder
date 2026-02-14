import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/sqlite';
import { ApiError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw ApiError.badRequest('Email, password, and name are required');
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existing) {
      throw ApiError.conflict('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    db.prepare(`
      INSERT INTO users (id, email, password, name)
      VALUES (?, ?, ?, ?)
    `).run(id, email, hashedPassword, name);

    const token = jwt.sign(
      { id, email, name },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: { id, email, name, subscription: 'free' },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as {
      id: string;
      email: string;
      password: string;
      name: string;
      subscription: string;
    } | undefined;

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription: user.subscription,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, email, name, subscription, created_at FROM users WHERE id = ?')
      .get(req.userId) as {
        id: string;
        email: string;
        name: string;
        subscription: string;
        created_at: string;
      } | undefined;

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', (req, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token required');
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET || 'default-secret'
    ) as { id: string };

    const db = getDb();
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?')
      .get(decoded.id) as { id: string; email: string; name: string } | undefined;

    if (!user) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const newToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (error) {
    next(error);
  }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
