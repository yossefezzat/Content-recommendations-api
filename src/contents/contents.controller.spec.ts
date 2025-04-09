import { Test, TestingModule } from '@nestjs/testing';
import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';
import { CreateContentDto } from './dto/create-content.dto';
import { FilterContentDto } from './dto/filter-content.dto';
import { ContentType } from './constants/content-type.enum';
import { ContentTags } from './constants/content-tags.enum';

describe('ContentsController', () => {
  let controller: ContentsController;
  let service: ContentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentsController],
      providers: [
        {
          provide: ContentsService,
          useValue: {
            create: jest.fn(),
            filterContents: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContentsController>(ContentsController);
    service = module.get<ContentsService>(ContentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call ContentsService.create with correct parameters', async () => {
      const createContentDto: CreateContentDto = { 
        title: 'Sample Content',
        type: ContentType.ARTICLE,
        tags: [ContentTags.BUSINESS, ContentTags.EDUCATION],
      };
      const result = { id: 'mock-id', ...createContentDto, popularity: 0, createdAt: new Date(), interactions: [] };
      jest.spyOn(service, 'create').mockResolvedValueOnce(result);

      expect(await controller.create(createContentDto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createContentDto);
    });
  });

  describe('filterContent', () => {
    it('should call ContentsService.filterContents with correct parameters', async () => {
      const filterContentDto: FilterContentDto = { 
        type: ContentType.ARTICLE, 
        tags: `${ContentTags.BUSINESS},${ContentTags.EDUCATION}`, 
        page: 1, 
        pageSize: 10 
      };
      const tagsArray = (filterContentDto.tags ?? '').split(',');
      const result = [
        {
          id: '1',
          title: 'Test Content',
          type: ContentType.ARTICLE,
          tags: tagsArray,
          popularity: 100,
          createdAt: new Date(),
          interactions: [],
        },
      ];
      jest.spyOn(service, 'filterContents').mockResolvedValueOnce(result);
  
      expect(await controller.filterContent(filterContentDto)).toEqual(result);
      expect(service.filterContents).toHaveBeenCalledWith(
        filterContentDto.type,
        tagsArray,
        filterContentDto.page,
        filterContentDto.pageSize,
      );
    });
  });

  describe('remove', () => {
    it('should call ContentsService.remove with correct parameters', async () => {
      const id = '1';
      jest.spyOn(service, 'remove').mockResolvedValueOnce(undefined);

      expect(await controller.remove(id)).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
