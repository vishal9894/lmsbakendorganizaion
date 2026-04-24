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
            console.log('=== RAW TEXT ===');
            console.log(JSON.stringify(rawText.slice(0, 500)));
            console.log('=== END RAW ===');

            if (!rawText || rawText.trim().length === 0) {
                throw new BadRequestException('Word document appears to be empty');
            }

            // Strip leading/trailing whitespace and remove BOM for consistent detection
            const cleanText = rawText.trim().replace(/^\uFEFF/, '');
            const firstLine = cleanText.split(/\n/)[0];
            console.log('First line:', JSON.stringify(firstLine));
            console.log('Has numbered:', /^\d+[\.\)]\s/.test(cleanText), /^\d+[\.\)]\s/.test(firstLine));
            console.log('Has Question:', /\bQuestion:\s+/i.test(cleanText));
            const data: any[] = [];

            // Detect format by looking for patterns anywhere in the text
            // Detect format - check multiple patterns
            // 1. Numbered: "1." or "1)" at line start
            // 2. Hindi Question: format with "Question:" keyword
            const startsWithNumber = /^\s*\d+[\.\)]\s/.test(firstLine);
            const hasNumberedPattern = /\n\d+[\.\)]\s/.test(cleanText) || /^\d+[\.\)]\s/.test(cleanText);
            const hasQuestionKeyword = /\bQuestion:\s*/i.test(cleanText);
            console.log('Starts with number:', startsWithNumber, '| Has number pattern:', hasNumberedPattern, '| Has Question:', hasQuestionKeyword);

            let parseMode: 'numbered' | 'question' | null = null;

            if (startsWithNumber || hasNumberedPattern) {
                parseMode = 'numbered';
            } else if (hasQuestionKeyword) {
                parseMode = 'question';
            }

            console.log('Parse mode:', parseMode);

            if (parseMode === 'numbered') {
                // === NUMBERED FORMAT ===
                const questionBlocks = cleanText.split(/(?=\n|^)\s*\d+[\.\)]\s+/gm);

                for (const block of questionBlocks) {
                    if (!block.trim()) continue;

                    const trimmedBlock = block.trim();

                    // Check if this block starts with a number pattern
                    const numMatch = trimmedBlock.match(/^(\d+[\.\)]\s+)([\s\S]+)$/);
                    if (!numMatch) continue;

                    let content = numMatch[2];

                    // Extract answer
                    const answerMatch = content.match(/Answer:\s*([A-Ea-e])/i);
                    const answer = answerMatch ? answerMatch[1].toUpperCase() : null;
                    const beforeAnswer = answerMatch ? content.slice(0, answerMatch.index!) : content;

                    // Extract question text: everything before the first option pattern
                    const questionMatch = beforeAnswer.match(/^(.+?)(?=\n\s*[A-Ea-e][\.\)]\s|\s*\([a-e]\)\s)/s);
                    const questionText = questionMatch ? questionMatch[1].trim().replace(/\s+/g, ' ').trim() : beforeAnswer.trim();

                    // Extract options
                    const options: Record<string, string> = {};
                    const lines = beforeAnswer.split(/\n/);
                    let currentOpt: string | null = null;
                    let currentText = '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;

                        // Skip if this is the question first line
                        if (questionText && trimmed === questionText.split('\n')[0]) continue;

                        // Match option with text on same line: "A. text" or "A) text" or "(a) text"
                        const optFullMatch = trimmed.match(/^([A-Ea-e])[\.\)]\s+(.+)/);
                        const optParenMatch = trimmed.match(/^\(([a-e])\)\s*(.+)/);
                        // Match standalone option label: "A." or "B)" at start of line (with optional whitespace)
                        const optStandalone = trimmed.match(/^([A-Ea-e])[\.\)]\s*$/);

                        if (optFullMatch) {
                            if (currentOpt) options[currentOpt] = currentText.trim();
                            currentOpt = optFullMatch[1].toLowerCase();
                            currentText = optFullMatch[2];
                        } else if (optStandalone) {
                            if (currentOpt) options[currentOpt] = currentText.trim();
                            currentOpt = optStandalone[1].toLowerCase();
                            currentText = '';
                        } else if (optParenMatch) {
                            if (currentOpt) options[currentOpt] = currentText.trim();
                            currentOpt = optParenMatch[1].toLowerCase();
                            currentText = optParenMatch[2];
                        } else if (currentOpt && trimmed) {
                            // Continuation line of current option OR option text on next line (e.g., "C." then "12")
                            if (!currentText) {
                                currentText = trimmed;
                            } else {
                                currentText += ' ' + trimmed;
                            }
                        }
                    }
                    if (currentOpt) options[currentOpt] = currentText.trim();

                    if (!questionText || questionText.length < 2) continue;

                    data.push({
                        question: questionText,
                        option_a: options['a'] || null,
                        option_b: options['b'] || null,
                        option_c: options['c'] || null,
                        option_d: options['d'] || null,
                        option_e: options['e'] || null,
                        correctOption: answer || null,
                    });
                }
            } else if (parseMode === 'question') {
                // === HINDI FORMAT with "Question:" and "Answer:" ===
                const blocks = cleanText.split(/Question:/i);

                for (const block of blocks) {
                    if (!block.trim()) continue;

                    const trimmedBlock = block.trim();

                    // Extract question text: everything up to first (a) OR Answer:
                    const questionMatch = trimmedBlock.match(/(.+?)(?=\s*\([a-e]\)|Answer:|$)/is);
                    let questionText = questionMatch ? questionMatch[1].trim() : null;

                    if (!questionText || questionText.length < 2) continue;

                    // For match-the-following, assertion-reasoning, and fill-in-the-blank:
                    // If no simple options found, treat the whole block as question + options
                    const optMatch = [...trimmedBlock.matchAll(/\(([a-e])\)\s*([\s\S]*?)(?=\s*\([a-e]\)|Answer:|$)/gi)];
                    const options: Record<string, string> = {};
                    let hasSimpleOptions = false;

                    if (optMatch.length > 0) {
                        for (const m of optMatch) {
                            const key = m[1].toLowerCase();
                            let value = m[2].trim();
                            // Clean up: normalize whitespace
                            value = value.replace(/\s+/g, ' ').trim();
                            // Check if it's a simple short option (likely not a match-the-following type)
                            if (value.length < 200 && !value.includes('\n')) {
                                hasSimpleOptions = true;
                            }
                            options[key] = value;
                        }
                    }

                    // If it's a complex question (match-the-following, assertion-reasoning, fill-in-blank),
                    // preserve newlines in the question field
                    if (!hasSimpleOptions && Object.keys(options).length > 0) {
                        // Append all options back to the question text to preserve structure
                        const optionsText = Object.entries(options)
                            .map(([k, v]) => `(${k}) ${v}`)
                            .join(' ');
                        questionText = questionText + ' ' + optionsText;
                    }

                    // Extract answer
                    const answerMatch = trimmedBlock.match(/Answer:\s*([A-Ea-e])/i);
                    const answer = answerMatch ? answerMatch[1].toUpperCase() : null;

                    data.push({
                        question: questionText,
                        option_a: hasSimpleOptions ? options['a'] : null,
                        option_b: hasSimpleOptions ? options['b'] : null,
                        option_c: hasSimpleOptions ? options['c'] : null,
                        option_d: hasSimpleOptions ? options['d'] : null,
                        option_e: hasSimpleOptions ? options['e'] : null,
                        correctOption: answer || null,
                    });
                }
            }

            if (data.length === 0) {
                // Fallback: try numbered format (no detection)
                const numberedBlocks = cleanText.split(/(?=\n|^)\s*\d+[\.\)]\s+/gm);
                for (const block of numberedBlocks) {
                    if (!block.trim()) continue;
                    const numMatch = block.trim().match(/^(\d+[\.\)]\s+)([\s\S]+)$/);
                    if (!numMatch) continue;
                    let content = numMatch[2];
                    const answerMatch = content.match(/Answer:\s*([A-Ea-e])/i);
                    const answer = answerMatch ? answerMatch[1].toUpperCase() : null;
                    const beforeAnswer = answerMatch ? content.slice(0, answerMatch.index!) : content;
                    data.push({ question: beforeAnswer.trim(), option_a: null, option_b: null, option_c: null, option_d: null, option_e: null, correctOption: answer });
                }

                // Fallback: try question format (no detection)
                if (data.length === 0) {
                    const questionBlocks = cleanText.split(/Question:/i);
                    for (const block of questionBlocks) {
                        if (!block.trim()) continue;
                        const answerMatch = block.match(/Answer:\s*([A-Ea-e])/i);
                        const answer = answerMatch ? answerMatch[1].toUpperCase() : null;
                        const questionText = block.split(/\n/)[0].trim();
                        const optMatch = [...block.matchAll(/\(([a-e])\)\s*([^\n(]+)/gi)];
                        const options: Record<string, string> = {};
                        for (const m of optMatch) options[m[1].toLowerCase()] = m[2].trim();
                        data.push({
                            question: questionText,
                            option_a: options['a'] || null,
                            option_b: options['b'] || null,
                            option_c: options['c'] || null,
                            option_d: options['d'] || null,
                            option_e: options['e'] || null,
                            correctOption: answer || null,
                        });
                    }
                }
            }

            if (data.length === 0) {
                throw new BadRequestException('No valid questions found. Use format: "1. Question text A. option B. option C. option D. option Answer: X" or "Question: text (a) opt (b) opt Answer: X"');
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

            console.log(data);
            

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

