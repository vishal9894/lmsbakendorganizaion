import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { Admin } from '../../admin/entities/admin.entity';
import { User } from '../../users/entities/user.entity';
import { TenantManager } from '../../database/tenant-manager.service';
import { Organization } from '../../organizations/entities/create-organization.entityes';

export interface TenantRequest extends Request {
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId?: string;
    subdomain?: string;
    type: 'super_admin' | 'tenant_admin';
  };
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
    subdomain: string;
  };
}

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    private tenantManager: TenantManager,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token required');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'default_secret_key';
      const decoded = this.jwtService.verify(token, { secret }) as {
        sub: string;
        email: string;
        role?: string;
        organizationId?: string;
        subdomain?: string;
      };

      // Super admin - no organization
      if (!decoded.organizationId) {
        const admin = await this.adminRepo.findOne({
          where: { id: decoded.sub },
        });

        if (!admin) {
          throw new UnauthorizedException('Admin not found');
        }

        request.admin = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.roleName,
          type: 'super_admin',
        };
      } else {
        // Tenant admin - verify subdomain exists
        if (!decoded.subdomain) {
          throw new UnauthorizedException('Token missing subdomain for tenant admin');
        }

        // Tenant admin - fetch from organization database
        const tenantDataSource = await this.tenantManager.getTenantConnection(decoded.subdomain);
        const tenantAdminRepo = tenantDataSource.getRepository(Admin);

        const admin = await tenantAdminRepo.findOne({
          where: { id: decoded.sub },
        });

        if (!admin) {
          throw new UnauthorizedException('Admin not found in organization');
        }

        // Verify organization still exists
        const org = await this.orgRepo.findOne({
          where: { id: decoded.organizationId },
        });

        if (!org) {
          throw new UnauthorizedException('Organization not found');
        }

        request.admin = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.roleName,
          organizationId: decoded.organizationId,
          subdomain: decoded.subdomain,
          type: 'tenant_admin',
        };
      }

      // Handle user role
      if (decoded.role === 'user') {
        if (!decoded.subdomain || !decoded.organizationId) {
          throw new UnauthorizedException('Token missing organization info for user');
        }

        const tenantDataSource = await this.tenantManager.getTenantConnection(decoded.subdomain);
        const tenantUserRepo = tenantDataSource.getRepository(User);

        const user = await tenantUserRepo.findOne({
          where: { id: decoded.sub },
        });

        if (!user) {
          throw new UnauthorizedException('User not found in organization');
        }

        request.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'user',
          organizationId: decoded.organizationId,
          subdomain: decoded.subdomain,
        };
      }

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('TenantAuthGuard Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException(`Invalid token: ${errorMessage}`);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.split(' ')[1];
  }
}
