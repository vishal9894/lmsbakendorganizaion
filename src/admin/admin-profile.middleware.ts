import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { TenantManager } from '../database/tenant-manager.service';

interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId?: string;
    subdomain?: string;
    type: 'super_admin' | 'tenant_admin';
  };
}

@Injectable()
export class AdminProfileMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private tenantManager: TenantManager,
  ) { }

  async use(req: AdminRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token required');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token) as {
        sub: string;
        email: string;
        role?: string;
        organizationId?: string;
        subdomain?: string;
      };

      // Check if super admin
      if (!decoded.organizationId) {
        const admin = await this.adminRepo.findOne({
          where: { id: decoded.sub },
        });

        if (!admin) {
          throw new UnauthorizedException('Admin not found');
        }

        req.admin = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.roleName,
          type: 'super_admin',
        };
      } else {
        // Tenant admin - fetch from organization database
        const tenantDataSource = await this.tenantManager.getTenantConnection(decoded.subdomain!);
        const tenantAdminRepo = tenantDataSource.getRepository(Admin);

        const admin = await tenantAdminRepo.findOne({
          where: { id: decoded.sub },
        });

        if (!admin) {
          throw new UnauthorizedException('Admin not found');
        }

        req.admin = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.roleName,
          organizationId: decoded.organizationId,
          subdomain: decoded.subdomain,
          type: 'tenant_admin',
        };
      }

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
