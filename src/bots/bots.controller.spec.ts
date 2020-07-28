import { Test, TestingModule } from '@nestjs/testing';
import { BotsController } from './bots.controller';

describe('Bots Controller', () => {
  let controller: BotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotsController],
    }).compile();

    controller = module.get<BotsController>(BotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
