import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// User object interface for request extension
interface AuthenticatedUser {
  id: string;
  type: 'authenticated' | 'anonymous';
  isAuthenticated: boolean;
  isAnonymous: boolean;
}

// Extend Express Request interface to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

/**
 * Unified middleware for handling both authenticated and anonymous users
 * Checks for x-user-id header (authenticated users) or creates/manages session (anonymous users)
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const userId = req.headers['x-user-id'] as string;

    if (userId) {
      // Authenticated user from external provider
      req.user = {
        id: userId,
        type: 'authenticated',
        isAuthenticated: true,
        isAnonymous: false,
      };
    } else {
      // Anonymous user - use existing session or create new one
      let sessionId =
        req.cookies?.sessionId || (req.headers['x-session-id'] as string);

      if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('sessionId', sessionId, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        if (req.cookies) {
          req.cookies.sessionId = sessionId;
        }
      }

      req.user = {
        id: sessionId,
        type: 'anonymous',
        isAuthenticated: false,
        isAnonymous: true,
      };
    }

    next();
  }
}
