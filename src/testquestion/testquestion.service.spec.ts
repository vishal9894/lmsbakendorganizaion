import { Test, TestingModule } from '@nestjs/testing';
import { TestquestionService } from './testquestion.service';

describe('TestquestionService', () => {
  let service: TestquestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestquestionService],
    }).compile();

    service = module.get<TestquestionService>(TestquestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
