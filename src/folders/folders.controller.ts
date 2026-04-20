import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder-dto';
import { UpdateFolderDto } from './dto/update-folder-dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';

interface CurrentUserData {
    id: string;
    email: string;
    subdomain?: string;
    organizationId?: string;
}

@Controller('folders')
@UseGuards(TenantAuthGuard)
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) { }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() createFolderDto: CreateFolderDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
       
        return this.foldersService.create(user.subdomain, createFolderDto);
    }

    @Get()
    findAll(@CurrentUser() user: CurrentUserData) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.foldersService.findAll(user.subdomain);
    }
    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.foldersService.findOne(user.subdomain, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() updateFolderDto: UpdateFolderDto,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.foldersService.update(user.subdomain, id, updateFolderDto);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.foldersService.remove(user.subdomain, id);
    }
}


