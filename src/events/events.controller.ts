import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event-dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

interface CurrentUserData {
    id: string;
    email: string;
    subdomain?: string;
    organizationId?: string;
}

@Controller('events')
@UseGuards(TenantAuthGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
   @UseInterceptors(FileInterceptor('image'))
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() createEventDto: CreateEventDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.eventsService.create(user.subdomain, createEventDto, file);
    }

    @Get()
    findAll(@CurrentUser() user: CurrentUserData) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.eventsService.findAll(user.subdomain);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.eventsService.findOne(user.subdomain, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() updateEventDto: Partial<CreateEventDto>,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.eventsService.update(user.subdomain, id, updateEventDto);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.eventsService.remove(user.subdomain, id);
    }
}
