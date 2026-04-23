import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ForbiddenException } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder-dto';
import { UpdateFolderDto } from './dto/update-folder-dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { Req } from '@nestjs/common';


@Controller('folders')
@UseGuards(TenantAuthGuard)
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) { }

    private getSubdomain(user: CurrentUserData): string {
        if (!user.subdomain) {
            throw new ForbiddenException('Subdomain is required');
        }
        return user.subdomain;
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() createFolderDto: CreateFolderDto,
        @Req() req: any,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.foldersService.create(subdomain, req.body);
    }

    @Get()
    findAll(@CurrentUser() user: CurrentUserData) {
        const subdomain = this.getSubdomain(user);
        return this.foldersService.findAll(subdomain);
    }
    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.foldersService.findOne(subdomain, id);
    }

    @Get('parent/:parentId')
    getFolderInParentId(
        @CurrentUser() user: CurrentUserData,
        @Param('parentId') parentId: string,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.foldersService.getFolderInParentId(subdomain, parentId);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() updateFolderDto: UpdateFolderDto,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.foldersService.update(subdomain, id, updateFolderDto);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.foldersService.remove(subdomain, id);
    }
}
