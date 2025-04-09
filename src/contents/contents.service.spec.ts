import { Test, TestingModule } from '@nestjs/testing';
import { ContentsService } from './contents.service';
import { ContentRepository } from './repositories/content.repository';
import { NotFoundException } from '@nestjs/common';
import { Content } from './entities/content.entity';
import { ContentType } from './constants/content-type.enum';
import { ContentTags } from './constants/content-tags.enum';

jest.mock('./repositories/content.repository');

describe('ContentsService', () => {
  let service: ContentsService;
  let repository: jest.Mocked<ContentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentsService, ContentRepository],
    }).compile();

    service = module.get<ContentsService>(ContentsService);
    repository = module.get(ContentRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new content', async () => {
      const createContentDto = { title: 'Test Content', type: ContentType.ARTICLE, tags: [ContentTags.BUSINESS] };
      const savedContent = { id: '1', ...createContentDto } as Content;

      repository.create.mockReturnValueOnce(savedContent);
      repository.save.mockResolvedValueOnce(savedContent);

      const result = await service.create(createContentDto);
      expect(result).toEqual(savedContent);
      expect(repository.create).toHaveBeenCalledWith(createContentDto);
      expect(repository.save).toHaveBeenCalledWith(savedContent);
    });
  });

  describe('filterContents', () => {
    it('should return filtered contents', async () => {
      const contents = [{ id: '1', title: 'Test Content' }] as Content[];
      const queryBuilder: any = {
        getMany: jest.fn().mockResolvedValueOnce(contents),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder);
      repository.applyTypeFilter.mockImplementation();
      repository.applyTagFilters.mockImplementation();
      repository.applySorting.mockImplementation();
      repository.applyPagination.mockImplementation();

      const result = await service.filterContents('article', ['test'], 1, 10);
      expect(result).toEqual(contents);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('content');
    });
  });

  describe('findOne', () => {
    it('should return a content by ID', async () => {
      const content = { id: '1', title: 'Test Content' } as Content;
      repository.findOne.mockResolvedValueOnce(content);

      const result = await service.findOne('1');
      expect(result).toEqual(content);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if content is not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a content by ID', async () => {
      const content = { id: '1', title: 'Test Content' } as Content;
      repository.findOne.mockResolvedValueOnce(content);
      repository.remove.mockResolvedValueOnce(content);

      await service.remove('1');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.remove).toHaveBeenCalledWith(content);
    });

    it('should throw NotFoundException if content is not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateContent', () => {
    it('should update and return the updated content', async () => {
      const updateData = { popularity: 5 };
      const content = { id: '1', title: 'Old Content' } as Content;
      const updatedContent = { ...content, ...updateData };

      repository.findOne.mockResolvedValueOnce(content);
      repository.save.mockResolvedValueOnce(updatedContent);

      const result = await service.updateContent('1', updateData);
      expect(result).toEqual(updatedContent);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.save).toHaveBeenCalledWith(updatedContent);
    });

    it('should throw NotFoundException if content is not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.updateContent('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculatePopularity', () => {
    it('should calculate and return the popularity score', () => {
      const interactions = {
        ratings: [4, 5],
        comments: 2,
        likes: 10,
        shares: 3,
      };
      const expectedScore = 10 * 1 + 2 * 3 + 3 * 5 + 4.5 * 2;

      const result = service.calculatePopularity(interactions);
      expect(result).toBe(expectedScore);
    });
  });

  describe('findFreshContentNotSeenByUser', () => {
    it('should return fresh content not seen by the user', async () => {
      const contents = [{ id: '1', title: 'Fresh Content' }] as Content[];
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(contents),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findFreshContentNotSeenByUser('user1', 30);
      expect(result).toEqual(contents);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('content');
    });
  });
});
