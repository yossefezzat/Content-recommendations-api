import { Test, TestingModule } from '@nestjs/testing';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { InteractionType } from './constants/interaction-type.enum';

describe('InteractionsController', () => {
  let controller: InteractionsController;
  let interactionsService: InteractionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InteractionsController],
      providers: [
        {
          provide: InteractionsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InteractionsController>(InteractionsController);
    interactionsService = module.get<InteractionsService>(InteractionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST create', () => {
    const mockCreateInteractionDto: CreateInteractionDto = {
      userId: 'user-id',
      contentId: 'content-id',
      type: InteractionType.LIKE,
    };

    const mockInteraction = {
      id: 'interaction-id',
      ...mockCreateInteractionDto,
      timestamp: new Date(),
    };

    beforeEach(() => {
      jest.spyOn(interactionsService, 'create').mockResolvedValue(mockInteraction as any);
    });

    it('should call InteractionsService.create with correct parameters', async () => {
      const result = await controller.create(mockCreateInteractionDto);
      expect(interactionsService.create).toHaveBeenCalledWith(mockCreateInteractionDto);
      expect(result).toStrictEqual(mockInteraction);
    });

    it('should throw an error if InteractionsService.create fails', async () => {
      jest.spyOn(interactionsService, 'create').mockRejectedValue(new Error('Service error'));
      await expect(controller.create(mockCreateInteractionDto)).rejects.toThrow('Service error');
    });
  });
});