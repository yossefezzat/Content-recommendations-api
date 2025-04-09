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

  /**
   * Creates a new content entity and saves it to the repository.
   *
   * @param createContentDto - The data transfer object containing the details of the content to be created.
   * @returns A promise that resolves to the newly created content entity.
   */
  async create(createContentDto: CreateContentDto): Promise<Content> {
    const content = this.contentRepository.create(createContentDto);
    return await this.contentRepository.save(content);
  }

  /**
   * Filters and retrieves a list of contents based on the provided criteria.
   *
   * @param type - (Optional) The type of content to filter by.
   * @param tags - (Optional) An array of tags to filter the contents by.
   * @param page - (Optional) The page number for pagination. Defaults to 1.
   * @param pageSize - (Optional) The number of items per page for pagination. Defaults to 10.
   * @returns A promise that resolves to an array of filtered contents.
   */
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

  /**
   * Removes a content entity by its unique identifier.
   * 
   * @param id - The unique identifier of the content to be removed.
   * @returns A promise that resolves when the content has been successfully removed.
   * @throws Will throw an error if the content with the given ID is not found.
   */
  async remove(id: string): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepository.remove(content);
  }
  
  /**
   * Updates an existing content record with the provided data.
   *
   * @param id - The unique identifier of the content to update.
   * @param updateData - An object containing the fields to update in the content.
   * @returns A promise that resolves to the updated content.
   * @throws NotFoundException - If no content is found with the given ID.
   */
  async updateContent(id: string, updateData: UpdateContentDto): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Content not found`);
    }
    Object.assign(content, updateData);
    return await this.contentRepository.save(content);
  }
  
  /**
   * Calculates the popularity score of a content item based on user interactions.
   *
   * @param interactions - An object containing counts of various user interactions
   * such as ratings, comments, likes, and shares.
   * 
   * @returns The calculated popularity score as a number. The score is determined
   * by applying weights to different interaction types and combining them. Ratings
   * are averaged before being factored into the score.
   *
   * @remarks
   * - The weighting of interactions is currently hardcoded but could be made more
   *   sophisticated or configurable in the future.
   * - Consider using machine learning or a more complex algorithm for improved accuracy.
   */
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

  /**
   * Finds fresh content that has not been seen by a specific user within a given time frame.
   * 
   * @param userId - The ID of the user for whom to find unseen content.
   * @param days - The number of days to look back for fresh content (default is 30 days).
   * @returns A promise that resolves to an array of Content objects that match the criteria.
   * 
   * The method retrieves content created within the specified time frame (`days`),
   * excluding any content that the user has interacted with. Results are ordered
   * by creation date in descending order (most recent first).
   */
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