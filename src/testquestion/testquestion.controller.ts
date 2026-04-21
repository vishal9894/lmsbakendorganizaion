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
    UseInterceptors,
    UploadedFile,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TestquestionService } from './testquestion.service';
import { CreateTestquestionDto } from './dto/create-testquestion-dto';
import { UpdateTestquestionDto } from './dto/update-testquestion-dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';
import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';

@Controller('testquestions')
@UseGuards(TenantAuthGuard)
export class TestquestionController {
    constructor(private readonly testquestionService: TestquestionService) { }

    private getSubdomain(user: CurrentUserData): string {
        if (!user.subdomain) {
            throw new ForbiddenException('Subdomain is required');
        }
        return user.subdomain;
    }

    private async parseWordDocument(buffer: Buffer): Promise<any[]> {
        try {
            const result = await mammoth.extractRawText({ buffer });
            const rawText = result.value;

            // Try to find table-like structure with multiple delimiters
            const lines = rawText
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (lines.length === 0) {
                throw new BadRequestException('Word document appears to be empty');
            }

            const data: any[] = [];
            let headers: string[] = [];

            // Try different delimiters: tabs first, then commas, then multiple spaces
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let parts: string[] = [];

                // Try tab delimiter first (common in Word tables)
                if (line.includes('\t')) {
                    parts = line.split('\t').map(p => p.trim());
                }
                // Try comma delimiter
                else if (line.includes(',')) {
                    parts = line.split(',').map(p => p.trim());
                }
                // Try 2+ spaces as delimiter
                else {
                    parts = line.split(/\s{2,}/).map(p => p.trim());
                }

                // Filter out empty parts
                parts = parts.filter(p => p.length > 0);

                if (parts.length === 0) continue;

                if (i === 0) {
                    headers = parts;
                    // If first row has generic headers like "Column1", use default headers
                    if (headers.length < 2) {
                        headers = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'];
                    }
                } else if (parts.length >= 1) {
                    const row: Record<string, string> = {};
                    headers.forEach((header, index) => {
                        row[header] = parts[index] || '';
                    });
                    data.push(row);
                }
            }

            return data;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`Failed to parse Word document: ${error.message}`);
        }
    }

    @Post(':contentId')
    @UseInterceptors(FileInterceptor('questionImage'))
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() data: CreateTestquestionDto,
        @Param('contentId') contentId: string,
        @UploadedFile() questionImage?: Express.Multer.File,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.testquestionService.create(subdomain, contentId, data, { questionImage });
    }

    @Post('bulk/:contentId')
    @UseInterceptors(FileInterceptor('file'))
    async bulkUpload(
        @CurrentUser() user: CurrentUserData,
        @Param('contentId') contentId: string,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!file) {
            throw new ForbiddenException('File is required');
        }

        if (!file.buffer || file.buffer.length === 0) {
            throw new BadRequestException('File buffer is empty');
        }

        const validMimetypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'application/vnd.ms-excel.sheet.binary.macroEnabled.12', // .xlsb
            'text/csv', // .csv
            'application/csv',
            'text/plain', // some CSV files may have this
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/msword', // .doc
        ];

        if (!validMimetypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file type. Expected Excel, CSV, or Word file, got: ${file.mimetype}`);
        }
        const subdomain = this.getSubdomain(user);

        try {
            let data: any[] = [];

            // Handle Word documents
            if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.mimetype === 'application/msword') {
                data = await this.parseWordDocument(file.buffer);
            } else {
                // Handle Excel and CSV files
                const workbook = XLSX.read(file.buffer, { type: 'buffer' });

                if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                    throw new BadRequestException('Excel file contains no sheets');
                }

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                data = XLSX.utils.sheet_to_json(worksheet);
            }

            if (!data || data.length === 0) {
                throw new BadRequestException('File contains no valid data');
            }

            return this.testquestionService.bulkCreate(subdomain, contentId, data);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`Failed to parse file: ${error.message}`);
        }
    }

    @Get()
    findAll(
        @CurrentUser() user: CurrentUserData,
        @Query('contentId') contentId?: string,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.testquestionService.findAll(subdomain, contentId);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.testquestionService.findOne(subdomain, id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('questionImage'))
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() data: UpdateTestquestionDto,
        @UploadedFile() questionImage?: Express.Multer.File,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.testquestionService.update(subdomain, id, data, { questionImage });
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const subdomain = this.getSubdomain(user);
        return this.testquestionService.remove(subdomain, id);
    }
}
