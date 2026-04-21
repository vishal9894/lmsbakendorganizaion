import { Test, TestingModule } from '@nestjs/testing';
import { TestquestionController } from './testquestion.controller';

describe('TestquestionController', () => {
  let controller: TestquestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestquestionController],
    }).compile();

    controller = module.get<TestquestionController>(TestquestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
