import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { RecommendationDto } from './dtos/recommendation.dto';
import { ContentTags } from '../contents/constants/content-tags.enum';
import { ContentType } from '../contents/constants/content-type.enum';

describe('RecommendationsController', () => {
  let controller: RecommendationsController;
  let recommendationsService: RecommendationsService;

  const mockRecommendations: RecommendationDto[] = [
    {
      id: '1',
      title: 'Content 1',
      type: ContentType.VIDEO,
      tags: [ContentTags.EDUCATION],
      popularity: 100,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Content 2',
      type: ContentType.ARTICLE,
      tags: [ContentTags.HEALTH],
      popularity: 80,
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationsController],
      providers: [
        {
          provide: RecommendationsService,
          useValue: {
            getRecommendations: jest.fn().mockResolvedValueOnce(mockRecommendations),
          },
        },
      ],
    }).compile();

    controller = module.get<RecommendationsController>(RecommendationsController);
    recommendationsService = module.get<RecommendationsService>(RecommendationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /recommendations/:userId', () => {
    const userId = 'user-123';
    const page = 1;
    const limit = 10;

    it('should return recommendations for a user', async () => {
      const result = await controller.findUserRecommendations(userId, page, limit);
      expect(result).toEqual(mockRecommendations);
      expect(recommendationsService.getRecommendations).toHaveBeenCalledWith(userId, page, limit);
    });

    it('should use default pagination values when not provided', async () => {
      await controller.findUserRecommendations(userId, undefined, undefined);
      expect(recommendationsService.getRecommendations).toHaveBeenCalledWith(userId, undefined, undefined);
    });

    it('should throw an error if RecommendationsService.getRecommendations fails', async () => {
      jest.spyOn(recommendationsService, 'getRecommendations').mockRejectedValue(new Error('some error message'));
      await expect(controller.findUserRecommendations(userId, page, limit)).rejects.toThrow('some error message');
    });
  });
});