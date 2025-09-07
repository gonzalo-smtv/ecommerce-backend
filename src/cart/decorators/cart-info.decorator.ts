import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsersService } from '@app/users/users.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom decorator to extract cart information from the request
 * Gets userId from x-user-email header and sessionId from cookies or x-session-id header
 * Creates a new sessionId if neither userId nor sessionId is present
 */
export const CartInfo = createParamDecorator(
  async (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const usersService = request.app.get(UsersService);

    // Get user by email if available
    let userId;
    if (request.headers['x-user-email']) {
      const user = await usersService.findByEmail(
        request.headers['x-user-email'],
      );
      userId = user?.id;
    }

    // Get sessionId from cookies or headers
    let sessionId =
      request.cookies?.sessionId || request.headers['x-session-id'];

    // Create a sessionId if none exists
    if (!userId && !sessionId) {
      // Generate a new sessionId
      sessionId = uuidv4();

      // Set it in cookies if we have access to the response
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
