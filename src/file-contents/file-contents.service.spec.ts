import { Test, TestingModule } from '@nestjs/testing';
import { FileContentsService } from './file-contents.service';

describe('FileContentsService', () => {
  let service: FileContentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileContentsService],
    }).compile();

    service = module.get<FileContentsService>(FileContentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
