import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';
import { OmrSheetService } from './omr-sheet.service';
import { CreateSheetDto } from './dto/create-sheet-dto';
import { UpdateSheetDto } from './dto/update-sheet-dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';

@Controller('omr-sheets')
@UseGuards(TenantAuthGuard)
export class OmrSheetController {
    constructor(private readonly omrSheetService: OmrSheetService) { }

    private getSubdomain(user: CurrentUserData): string {
        if (!user.subdomain) {
            throw new ForbiddenException('Subdomain is required');
        }
        return user.subdomain;
    }

    @Post()
    async create(
        @CurrentUser() user: CurrentUserData,
        @Body() data: CreateSheetDto,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.omrSheetService.create(subdomain, data);
    }

    @Get()
    async findAll(
        @CurrentUser() user: CurrentUserData,
        @Query('examKey') examKey?: string,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.omrSheetService.findAll(subdomain, examKey);
    }

    @Get(':id')
    async findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.omrSheetService.findOne(subdomain, id);
    }

    @Put(':id')
    async update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() data: UpdateSheetDto,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.omrSheetService.update(subdomain, id, data);
    }

    @Delete(':id')
    async remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.omrSheetService.remove(subdomain, id);
    }

    @Delete('exam/:examKey')
    async removeByExamKey(
        @CurrentUser() user: CurrentUserData,
        @Param('examKey') examKey: string,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.omrSheetService.removeByExamKey(subdomain, examKey);
    }
}

