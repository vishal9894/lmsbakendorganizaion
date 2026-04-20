import { Test, TestingModule } from '@nestjs/testing';
import { TopstudentsService } from './topstudents.service';

describe('TopstudentsService', () => {
  let service: TopstudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TopstudentsService],
    }).compile();

    service = module.get<TopstudentsService>(TopstudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
