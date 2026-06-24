import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActorScope } from '../authz/scope';

export interface AuthenticatedUser extends ActorScope {
  userId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthenticatedUser;
  },
);
