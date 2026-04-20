import { Test, TestingModule } from '@nestjs/testing';
import { QuizsController } from './quizs.controller';

describe('QuizsController', () => {
  let controller: QuizsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizsController],
    }).compile();

    controller = module.get<QuizsController>(QuizsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
