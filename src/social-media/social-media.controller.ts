import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import { SocialMediaService } from './social-media.service';
import { CreateSocialMediaDto } from './dto/create-socialmedia';
import { UpdateSocialMediaDto } from './dto/update-socialmedia';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

interface CurrentUserData {
    id: string;
    email: string;
    subdomain?: string;
    organizationId?: string;
}

@Controller('social-media')
@UseGuards(TenantAuthGuard)
export class SocialMediaController {
    constructor(private readonly socialMediaService: SocialMediaService) { }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() createDto: CreateSocialMediaDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.socialMediaService.create(user.subdomain, createDto , file);
    }

    @Get()
    findAll(@CurrentUser() user: CurrentUserData) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.socialMediaService.findAll(user.subdomain);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.socialMediaService.findOne(user.subdomain, id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image'))
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() updateDto: UpdateSocialMediaDto ,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.socialMediaService.update(user.subdomain, id, updateDto, file);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.socialMediaService.remove(user.subdomain, id);
    }
}
