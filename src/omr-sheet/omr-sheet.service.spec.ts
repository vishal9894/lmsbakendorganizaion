import { Test, TestingModule } from '@nestjs/testing';
import { OmrSheetService } from './omr-sheet.service';

describe('OmrSheetService', () => {
  let service: OmrSheetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OmrSheetService],
    }).compile();

    service = module.get<OmrSheetService>(OmrSheetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
