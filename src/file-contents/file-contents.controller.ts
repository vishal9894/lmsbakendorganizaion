import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileContentsService } from './file-contents.service';
import { CreateContentDto } from './dto/create-file-content-dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

interface CurrentUserData {
    id: string;
    email: string;
    subdomain?: string;
    organizationId?: string;
}

@Controller('file-contents')
@UseGuards(TenantAuthGuard)
export class FileContentsController {
    constructor(private readonly fileContentsService: FileContentsService,
        

    ) { }

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'file', maxCount: 1 },
            { name: 'thumbnail', maxCount: 1 },
        ]),
    )
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() createContentDto: CreateContentDto,
        @UploadedFiles() files: { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        const pdfFile = files.file?.[0];
        const thumbnailFile = files.thumbnail?.[0];
        console.log('createContentDto', createContentDto);
        return this.fileContentsService.create(user.subdomain, createContentDto, pdfFile, thumbnailFile);
    }

    @Get()
    findAll(@CurrentUser() user: CurrentUserData) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.fileContentsService.findAll(user.subdomain);
    }

    @Get('test/:contentId')
    findTestQuestions(
        @CurrentUser() user: CurrentUserData,
        @Param('contentId') contentId: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.fileContentsService.findTestQuestions(user.subdomain, contentId);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.fileContentsService.findOne(user.subdomain, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() updateContentDto: Partial<CreateContentDto>,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.fileContentsService.update(user.subdomain, id, updateContentDto);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.fileContentsService.remove(user.subdomain, id);
    }
}

