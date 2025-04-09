import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';
import { UsersService } from '../users/users.service';
import { InteractionsService } from '../interactions/interactions.service';
import { ContentsService } from '../contents/contents.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '../users/entities/user.entity';
import { Content } from '../contents/entities/content.entity';
import { InteractionType } from '../interactions/constants/interaction-type.enum';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let usersService: UsersService;
  let interactionsService: InteractionsService;
  let contentsService: ContentsService;
  let cacheManager: Cache;

  const mockUser: User = {
    id: 'user-123',
    preferences: ['EDUCATION', 'HEALTH'],
  } as User;

  const mockInteractions = [ 
    {
      id: 'interaction-1',
      type: InteractionType.LIKE,
      content: { id: 'content-1', tags: ['EDUCATION'], createdAt: new Date() } as Content,
      user: new User
    },
    {
      id: 'interaction-2',
      type: 'comment',
      content: { id: 'content-2', tags: ['HEALTH'], createdAt: new Date() } as Content,
    },
  ];

  const mockContents: Content[] = [
    { id: 'content-3', tags: ['EDUCATION'], createdAt: new Date() } as Content,
    { id: 'content-4', tags: ['HEALTH'], createdAt: new Date() } as Content,
  ];

  const mockRecommendations: Content[] = [
    { id: 'content-3', tags: ['EDUCATION'], createdAt: new Date() } as Content,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: InteractionsService,
          useValue: {
            getUserRelevantInteractions: jest.fn().mockResolvedValue(mockInteractions),
          },
        },
        {
          provide: ContentsService,
          useValue: {
            findFreshContentNotSeenByUser: jest.fn().mockResolvedValue(mockContents),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
    usersService = module.get<UsersService>(UsersService);
    interactionsService = module.get<InteractionsService>(InteractionsService);
    contentsService = module.get<ContentsService>(ContentsService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecommendations', () => {
    const userId = 'user-123';
    const page = 1;
    const pageSize = 10;

    it('should return cached recommendations if available', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(mockRecommendations);

      const result = await service.getRecommendations(userId, page, pageSize);

      expect(cacheManager.get).toHaveBeenCalledWith(`recommendations:${userId}:${page}:${pageSize}`);
      expect(result).toEqual(mockRecommendations);
    });

    it('should fetch and calculate recommendations if cache is empty', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

      const result = await service.getRecommendations(userId, page, pageSize);

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(interactionsService.getUserRelevantInteractions).toHaveBeenCalledWith(userId);
      expect(contentsService.findFreshContentNotSeenByUser).toHaveBeenCalledWith(userId);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `recommendations:${userId}:${page}:${pageSize}`,
        expect.any(Array),
        60 * 60,
      );
      expect(result).toEqual(expect.any(Array));
    });

    it('should throw an error if fetching cached recommendations fails', async () => {
      jest.spyOn(cacheManager, 'get').mockRejectedValue(new Error('Cache error'));

      await expect(service.getRecommendations(userId, page, pageSize)).rejects.toThrow('Cache error');
    });
  });

  describe('cacheRecommendations', () => {
    const page = 1;
    const pageSize = 10;

    it('should cache recommendations', async () => {
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

      await service.cacheRecommendations('user-123', page, pageSize, mockRecommendations);

      expect(cacheManager.set).toHaveBeenCalledWith(
        `recommendations:user-123:${page}:${pageSize}`,
        mockRecommendations,
        60 * 60,
      );
    });
  });

  describe('getCachedRecommendations', () => {
    const userId = 'user-123';
    const page = 1;
    const pageSize = 10;

    it('should return cached recommendations if available', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(mockRecommendations);

      const result = await service.getCachedRecommendations(userId, page, pageSize);

      expect(cacheManager.get).toHaveBeenCalledWith(`recommendations:${userId}:${page}:${pageSize}`);
      expect(result).toEqual(mockRecommendations);
    });

    it('should return null if no cached recommendations are found', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      const result = await service.getCachedRecommendations(userId, page, pageSize);

      expect(cacheManager.get).toHaveBeenCalledWith(`recommendations:${userId}:${page}:${pageSize}`);
      expect(result).toBeNull();
    });

    it('should throw an error if cache retrieval fails', async () => {
      jest.spyOn(cacheManager, 'get').mockRejectedValue(new Error('Cache error'));

      await expect(service.getCachedRecommendations(userId, page, pageSize)).rejects.toThrow('Cache error');
    });
  });
});