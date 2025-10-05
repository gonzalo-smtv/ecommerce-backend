import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Guard to verify that the user is authenticated by external provider
 * Works with AuthMiddleware to check authentication status
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
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

    return true;
  }
}
