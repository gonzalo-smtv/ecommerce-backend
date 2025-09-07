import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to handle cart sessions for anonymous users
 * Creates a sessionId cookie if none exists and no user is authenticated
 */
@Injectable()
export class CartSessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Check if there's already a sessionId in cookies or an identified user
    if (!req.cookies?.sessionId && !req.headers['x-user-email']) {
      // If no sessionId or user, create a new sessionId
      const sessionId = uuidv4();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      req.cookies = req.cookies || {};
      req.cookies.sessionId = sessionId;
    }
    next();
  }
}
