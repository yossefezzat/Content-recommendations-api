import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { Content } from './entities/content.entity';
import { ContentRepository } from './repositories/content.repository';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentsService {
  constructor(
    private readonly contentRepository: ContentRepository
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    const content = this.contentRepository.create(createContentDto);
    return await this.contentRepository.save(content);
  }

  async filterContents(
    type?: string,
    tags?: string[],
    page = 1,
    pageSize = 10,
  ): Promise<Content[]> {
    const queryBuilder = this.contentRepository.createQueryBuilder('content');
  
    this.contentRepository.applyTypeFilter(queryBuilder, type);
    this.contentRepository.applyTagFilters(queryBuilder, tags);
    this.contentRepository.applySorting(queryBuilder);
    this.contentRepository.applyPagination(queryBuilder, page, pageSize);
    
    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Content not found`);
    }
    return content;
  }

  async remove(id: string): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepository.remove(content);
  }
  
  async updateContent(id: string, updateData: UpdateContentDto): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Content not found`);
    }
    Object.assign(content, updateData);
    return await this.contentRepository.save(content);
  }
  
  calculatePopularity(interactions: InteractionCounts): number {
    // TODO: we can handle this weighting in a more sophisticated way, e.g. using machine learning or a more complex algorithm
    // TODO: we can configure this to be ENV or something to change it easily
    const { ratings, comments, likes, shares } = interactions;
    const weights = {
      like: 1,
      comment: 3,
      share: 5,
      rate: 2
    };
    
    const avgRating =  ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length: 0;
    
    return (
      weights.like * likes +
      weights.comment * comments +
      weights.share * shares +
      weights.rate * avgRating
    );
  }

  async findFreshContentNotSeenByUser(userId: string, days = 30): Promise<Content[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.contentRepository.createQueryBuilder('content')
      .where('content.createdAt >= :cutoffDate', { cutoffDate })
      .andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('interaction.contentId')
          .from('interaction', 'interaction')
          .where('interaction.userId = :userId', { userId })
          .getQuery();
  
        return 'content.id NOT IN ' + subQuery;
      })
      .orderBy('content.createdAt', 'DESC')
      .getMany();
  }
} 