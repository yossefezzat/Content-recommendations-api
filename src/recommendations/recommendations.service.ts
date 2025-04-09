import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InteractionsService } from '../interactions/interactions.service';
import { ContentsService } from '../contents/contents.service';
import { Interaction } from '../interactions/entities/interaction.entity';
import { User } from '../users/entities/user.entity';
import { Content } from '../contents/entities/content.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly userService: UsersService,
    private readonly contentRepository: ContentsService,
    private readonly interactionService: InteractionsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Calculates a user's tag profile based on their interactions and preferences.
   * 
   * This method computes a score for each tag associated with the user's interactions
   * and preferences. The score is determined by the type of interaction, its weight,
   * and any associated rating. User preferences are also factored into the score.
   * 
   * @param user - The user for whom the tag profile is being calculated. Includes user preferences.
   * @param interactions - A list of interactions the user has had with content, including tags, type, and rating.
   * @returns A record where the keys are tags and the values are the calculated scores for each tag.
   */
  private calculateUserTagProfile(user: User, interactions: Interaction[]): Record<string, number> {
    const tagScores: Record<string, number> = {};
    // TODO: make this env variable
    const interactionWeights = {
      like: 1,
      comment: 3,
      share: 5,
      rate: 2
    };
  
    for (const interaction of interactions) {
      const tags = interaction.content.tags;

      const interactionWeight = interactionWeights[interaction.type] || 1;
      const totalWeight = interactionWeight + (interaction.rating || 0);
  
      for (const tag of tags) {
        tagScores[tag] = (tagScores[tag] || 0) + totalWeight;
      }
    }
  
    for (const tag of user.preferences) {
      tagScores[tag] = (tagScores[tag] || 0) + 5;
    }
  
    return tagScores;
  }

  /**
   * Calculates a score for a given content item based on its tags and freshness.
   *
   * @param content - The content item to be scored, containing tags and creation date.
   * @param tagScores - A record mapping tags to their respective scores.
   * @returns The calculated score for the content item, which is a combination of 
   *          tag-based scoring and a freshness boost. The freshness boost decreases 
   *          as the content gets older, following a decay curve.
   */
  private scoreContent(content: Content, tagScores: Record<string, number>): number {
    const tagScore = content.tags.reduce((sum, tag) => sum + (tagScores[tag] || 0), 0);
    const daysSinceCreated =(Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const freshnessBoost = 1 / (1 + daysSinceCreated); // decay curve
    return tagScore + freshnessBoost * 10;
  }

  /**
   * Caches the recommendations for a specific user and page.
   *
   * @param userId - The unique identifier of the user.
   * @param page - The page number of the recommendations.
   * @param pageSize - The number of recommendations per page.
   * @param recommendations - The list of content recommendations to cache.
   * 
   * @remarks
   * The cached recommendations are stored with a key in the format 
   * `recommendations:{userId}:{page}:{pageSize}` and expire after 1 hour.
   * The expiration time is currently hardcoded but should be configurable via an environment variable.
   */
  async cacheRecommendations(userId: string, page: number, pageSize: number, recommendations: Content[]) {
    const cacheTTL = parseInt(process.env.RECOMMENDATIONS_CACHE_TTL || '3600', 10);
    await this.cacheManager.set(`recommendations:${userId}:${page}:${pageSize}`, recommendations, cacheTTL);
  }
 
  /**
   * Retrieves cached recommendations for a specific user and pagination parameters.
   * 
   * @param userId - The unique identifier of the user for whom recommendations are being fetched.
   * @param page - The page number of the recommendations to retrieve.
   * @param pageSize - The number of recommendations per page.
   * @returns A promise that resolves to an array of cached recommendations if available, or `null` if no cache exists.
   */
  async getCachedRecommendations(userId: string, page: number, pageSize: number) {
    const cachedRecommendations = await this.cacheManager.get<Content[]>(`recommendations:${userId}:${page}:${pageSize}`);
    if (cachedRecommendations) {
      return cachedRecommendations;
    }
    return null;
  }

  /**
   * Retrieves personalized content recommendations for a user based on their interactions and preferences.
   * 
   * @param userId - The unique identifier of the user for whom recommendations are being generated.
   * @param page - The page number for paginated results (default is 1).
   * @param pageSize - The number of recommendations to return per page (default is 10).
   * @returns A promise that resolves to an array of recommended content items.
   */
  async getRecommendations(userId: string, page: number = 1, pageSize: number = 10): Promise<Content[]> {
    const cachedRecommendations = await this.getCachedRecommendations(userId, page, pageSize);
    if (cachedRecommendations) {
      return cachedRecommendations;
    }

    const user = await this.userService.findOne(userId);
    const interactions = await this.interactionService.getUserRelevantInteractions(userId);
    
    const tagScores = this.calculateUserTagProfile(user, interactions);
    const candidates = await this.contentRepository.findFreshContentNotSeenByUser(userId);
    
    // HINT: We can cache this scored results also and get fresh recommendations from it.
    const scoredResults = candidates.map(content => ({
      content,
      score: this.scoreContent(content, tagScores),
    }));
  
    const sortedResults = scoredResults
      .sort((a, b) => b.score - a.score)
      .map(item => item.content);
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const recommendationResults = sortedResults.slice(startIndex, endIndex);
    await this.cacheRecommendations(userId, page, pageSize, recommendationResults);

    return recommendationResults
  }
}
