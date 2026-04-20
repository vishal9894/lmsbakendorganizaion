import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  subdomain?: string;
  type: 'super_admin' | 'tenant_admin';
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.admin as CurrentUserData | undefined;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // If specific field requested, return that field
    if (data) {
      return user[data];
    }

    return user;
  },
);
