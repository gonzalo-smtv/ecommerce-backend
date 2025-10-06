import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthMiddleware } from '@app/auth/middleware/auth.middleware';

/**
 * Generic decorator to extract user information from the request
 * Can be used by any module that needs user identification
 * Uses the centralized auth logic from AuthMiddleware
 */
export const UserInfo = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // Use the centralized auth logic
    const { userId, sessionId } = AuthMiddleware.getUserInfo(request);

    return {
      userId,
      sessionId,
      isAuthenticated: !!userId,
      isAnonymous: !userId,
    };
  },
);

/**
 * Type definition for UserInfo decorator return value
 */
export type UserInfoType = {
  userId?: string;
  sessionId?: string;
  isAuthenticated: boolean;
  isAnonymous: boolean;
};
