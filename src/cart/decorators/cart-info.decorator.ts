import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom decorator to extract cart information from the request
 * Gets userId from x-user-email header and sessionId from cookies or x-session-id header
 * Creates a new sessionId if neither userId nor sessionId is present
 */
export const CartInfo = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    let sessionId =
      request.cookies?.sessionId || request.headers['x-session-id'];

    if (!userId && !sessionId) {
      sessionId = uuidv4();
      if (request.res) {
        request.res.cookie('sessionId', sessionId, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
      }
    }

    return { userId, sessionId };
  },
);
