import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthedRequest } from '../../types/express';
import { AuthService } from './auth.service';

/**
 * Only allows requests containg a valid API token in the `Authorization` header.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  /**
   * Check if an execution pipeline should be allowed to continue.
   * @param context Execution context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (request.headers.authorization) {
      // Remove 'Bearer' prefix
      const token = request.headers.authorization.replace(/^bearer /i, '');
      const user = await this.authService.validateToken(token);

      (request as AuthedRequest).user = user;

      return Boolean(user);
    }

    return false;
  }
}
