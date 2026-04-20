import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/create-organization.entityes';
import slugify from 'slugify';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,

    private dataSource: DataSource, // ✅ inject this
  ) { }

  async createOrganization(name: string) {
    const subdomain = slugify(name, { lower: true });

    const exists = await this.orgRepo.findOne({
      where: { subdomain },
    });

    if (exists) throw new Error('Subdomain already exists');

    const dbName = `db_${subdomain}`;

    // ✅ FIX: use injected datasource (already connected)
    await this.dataSource.query(`CREATE DATABASE "${dbName}"`);

    // ⚠️ use env password instead of hardcoded
    const password = process.env.DB_PASSWORD || 'postgres';

    const dbUrl = `postgresql://postgres:${encodeURIComponent(password)}@localhost:5432/${dbName}`;

    // 2. Save org
    const org = this.orgRepo.create({
      name,
      subdomain,
      db_name: dbName,
      db_url: dbUrl,
    });

    await this.orgRepo.save(org);

    return {
      message: 'Organization created',
      url: `${subdomain}.yourapp.com`,
    };
  }


  async getAllOrganizations() {
    const organizations = await this.orgRepo.find();
    return organizations;
  }

  async updateOrganization(id: string, name: string) {
    const organization = await this.orgRepo.findOne({
      where: { id },
    });

    if (!organization) throw new Error('Organization not found');

    organization.name = name;
    await this.orgRepo.save(organization);

    return {
      message: 'Organization updated',
    };
  }

  async deleteOrganization(id: string) {
    const organization = await this.orgRepo.findOne({
      where: { id },
    });

    if (!organization) throw new Error('Organization not found');

    await this.orgRepo.remove(organization);

    return {
      message: 'Organization deleted',
    };
  }

  async udpatestatus(id: string, status: string) {
    const organization = await this.orgRepo.findOne({
      where: { id },
    });

    if (!organization) throw new Error('Organization not found');

    organization.status = status === 'true' ? 'true' : 'false';
    await this.orgRepo.save(organization);

    return {
      message: 'Organization status updated',
    };
  }
}
