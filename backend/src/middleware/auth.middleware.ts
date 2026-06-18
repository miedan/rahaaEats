import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    sendError(res, 401, 'UNAUTHORIZED', 'Missing or invalid Authorization header');
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    sendError(res, 401, 'TOKEN_EXPIRED', 'Access token is invalid or expired');
  }
}
