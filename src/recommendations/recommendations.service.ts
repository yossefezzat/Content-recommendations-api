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

  private calculateUserTagProfile(user: User, interactions: Interaction[]): Record<string, number> {
    const tagScores: Record<string, number> = {};
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

  private scoreContent(content: Content, tagScores: Record<string, number>): number {
    const tagScore = content.tags.reduce((sum, tag) => sum + (tagScores[tag] || 0), 0);
    const daysSinceCreated =(Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const freshnessBoost = 1 / (1 + daysSinceCreated); // decay curve
    return tagScore + freshnessBoost * 10;
  }

  async cacheRecommendations(userId: string, page: number, pageSize: number, recommendations: Content[]) {
    await this.cacheManager.set(`recommendations:${userId}:${page}:${pageSize}`, recommendations, 60*60); // TODO: to be an ENV Cache for 1 hour
  }
 
  async getCachedRecommendations(userId: string, page: number, pageSize: number) {
    const cachedRecommendations = await this.cacheManager.get<Content[]>(`recommendations:${userId}:${page}:${pageSize}`);
    if (cachedRecommendations) {
      return cachedRecommendations;
    }
    return null;
  }

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
