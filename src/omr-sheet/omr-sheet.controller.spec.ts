import { Test, TestingModule } from '@nestjs/testing';
import { OmrSheetController } from './omr-sheet.controller';

describe('OmrSheetController', () => {
  let controller: OmrSheetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OmrSheetController],
    }).compile();

    controller = module.get<OmrSheetController>(OmrSheetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
