import { Test, TestingModule } from '@nestjs/testing';
import { TopstudentsController } from './topstudents.controller';

describe('TopstudentsController', () => {
  let controller: TopstudentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopstudentsController],
    }).compile();

    controller = module.get<TopstudentsController>(TopstudentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
