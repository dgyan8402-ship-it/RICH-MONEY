import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rich_money_ghana_secure_jwt_secret_2026_dev';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { id: string; email: string; role: string; fullName: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export function hashPassword(plain: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plain, salt);
}

export function comparePassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  let token: string | undefined;

  // Check Bearer Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
    return;
  }

  const user = db.getUserById(payload.id);
  if (!user) {
    res.status(401).json({ error: 'User account not found.' });
    return;
  }

  if (user.isFrozen) {
    res.status(403).json({ error: 'Account is temporarily frozen by administration. Contact support.' });
    return;
  }

  req.user = user;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrative privileges required.' });
    return;
  }
  next();
}

export function sanitizeUser(user: User): Omit<User, 'passwordHash' | 'securityAnswerHash'> {
  const { passwordHash, securityAnswerHash, ...safe } = user;
  return safe;
}
