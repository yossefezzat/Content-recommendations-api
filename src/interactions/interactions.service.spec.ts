import { Test, TestingModule } from '@nestjs/testing';
import { InteractionsService } from './interactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Interaction } from './entities/interaction.entity';
import { UsersService } from '../users/users.service';
import { ContentsService } from '../contents/contents.service';
import { Repository } from 'typeorm';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { InteractionType } from './constants/interaction-type.enum';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ContentType } from '../contents/constants/content-type.enum';

describe('InteractionsService', () => {
  let service: InteractionsService;
  let interactionRepository: Repository<Interaction>;
  let usersService: UsersService;
  let contentsService: ContentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteractionsService,
        {
          provide: getRepositoryToken(Interaction),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ContentsService,
          useValue: {
            findOne: jest.fn(),
            calculatePopularity: jest.fn(),
            updateContent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InteractionsService>(InteractionsService);
    interactionRepository = module.get<Repository<Interaction>>(getRepositoryToken(Interaction));
    usersService = module.get<UsersService>(UsersService);
    contentsService = module.get<ContentsService>(ContentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if user is not found', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValueOnce(null);

      const dto: CreateInteractionDto = {
        userId: 'user-id',
        contentId: 'content-id',
        type: InteractionType.LIKE,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if content is not found', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValueOnce({ id: 'user-id' });
      (contentsService.findOne as jest.Mock).mockResolvedValueOnce(null);

      const dto: CreateInteractionDto = {
        userId: 'user-id',
        contentId: 'content-id',
        type: InteractionType.LIKE,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if rating is missing for RATE type', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValueOnce({ id: 'user-id' });
      (contentsService.findOne as jest.Mock).mockResolvedValueOnce({ id: 'content-id' });

      const dto: CreateInteractionDto = {
        userId: 'user-id',
        contentId: 'content-id',
        type: InteractionType.RATE,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if interaction already exists', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValueOnce({ id: 'user-id' });
      (contentsService.findOne as jest.Mock).mockResolvedValueOnce({ id: 'content-id' });
      (interactionRepository.findOne as jest.Mock).mockResolvedValueOnce({ id: 'interaction-id' });

      const dto: CreateInteractionDto = {
        userId: 'user-id',
        contentId: 'content-id',
        type: InteractionType.LIKE,
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should create and save a new interaction', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValueOnce({ id: 'user-id' });
      (contentsService.findOne as jest.Mock).mockResolvedValueOnce({ id: 'content-id' });
      (interactionRepository.findOne as jest.Mock).mockResolvedValueOnce(null);
      (interactionRepository.create as jest.Mock).mockReturnValueOnce({ id: 'new-interaction-id' });
      (interactionRepository.save as jest.Mock).mockResolvedValueOnce({ id: 'new-interaction-id' });

      const dto: CreateInteractionDto = {
        userId: 'user-id',
        contentId: 'content-id',
        type: InteractionType.LIKE,
      };

      const result = await service.create(dto);

      expect(result).toEqual({ id: 'new-interaction-id' });
      expect(interactionRepository.create).toHaveBeenCalledWith({
        userId: 'user-id',
        contentId: 'content-id',
        type: InteractionType.LIKE,
        user: { id: 'user-id' },
        content: { id: 'content-id' },
      });
      expect(interactionRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateContentPopularity', () => {
    it('should calculate and update content popularity', async () => {
      const mockInteractions = [
        { 
          id: 'like-id', 
          type: InteractionType.LIKE, 
          timestamp: new Date(), 
          user: { id: 'user-id', username: 'user-1', preferences: [ContentType.ARTICLE], interactions: [] }, 
          content: { 
            id: 'content-id', 
            title: 'Sample Content', 
            type: ContentType.ARTICLE, 
            tags: ['tag1', 'tag2'], 
            popularity: 0, 
            createdAt: new Date(), 
            interactions: [] 
          } 
        },
        { 
          id: 'share-id', 
          type: InteractionType.SHARE, 
          timestamp: new Date(), 
          user: { id: 'user-id', username: 'user-1', preferences: [ContentType.ARTICLE], interactions: [] }, 
          content: { 
            id: 'content-id', 
            title: 'Sample Content', 
            type: ContentType.ARTICLE, 
            tags: ['tag1', 'tag2'], 
            popularity: 0, 
            createdAt: new Date(), 
            interactions: [] 
          } 
        },
      ];
      const mockPopularity = 100;
      const contentId = 'content-id';

      jest.spyOn(service, 'findByContentId').mockResolvedValueOnce(mockInteractions);
      (contentsService.calculatePopularity as jest.Mock).mockReturnValueOnce(mockPopularity);
      (contentsService.updateContent as jest.Mock).mockResolvedValueOnce({ 
        id: contentId, 
        popularity: mockPopularity 
      });

      await service.updateContentPopularity(contentId);

      expect(contentsService.calculatePopularity).toHaveBeenCalledWith({
        likes: 1,
        shares: 1,
        comments: 0,
        ratings: []
      });
      expect(contentsService.updateContent).toHaveBeenCalledWith(contentId, { 
        popularity: mockPopularity 
      });
    });
  });
});