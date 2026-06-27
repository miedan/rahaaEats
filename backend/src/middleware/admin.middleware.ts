import { Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from './auth.middleware';
import { sendError } from '../utils/response';

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  authenticate(req, res, () => {
    if (req.userRole !== 'ADMIN') {
      sendError(res, 403, 'FORBIDDEN', 'Admin access required');
      return;
    }
    next();
  });
}
