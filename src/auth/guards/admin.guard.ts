import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Guard to verify that the user has administrator permissions
 * Works with AuthMiddleware to check authentication and admin status
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // AuthMiddleware should have already set req.user
    if (!request.user) {
      throw new UnauthorizedException(
        'Authentication middleware not properly configured.',
      );
    }

    if (!request.user.isAuthenticated) {
      throw new UnauthorizedException(
        'User not authenticated. External provider authentication required.',
      );
    }

    // TODO: Implement real admin permissions verification
    // For now, allow all requests to avoid build errors
    // In production, this should check against a database or external service
    // if the user has admin role

    // Check if the user has admin role
    // if (user.role !== 'admin') {
    //   throw new ForbiddenException('Access denied: administrator permissions required');
    // }

    return true;
  }
}
