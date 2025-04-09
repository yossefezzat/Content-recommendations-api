import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiOkResponse, ApiHeader } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { RecommendationDto } from './dtos/recommendation.dto';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get recommendations for a user' })
  @ApiParam({ name: 'userId', description: 'ID of the user', type: String, example: '12345' })
  @ApiQuery({ name: 'page', description: 'Page number for pagination', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Number of items per page', required: false, type: Number, example: 10 })
  @ApiHeader({ name: 'x-apikey', description: 'API key for authentication', required: true })
  @ApiOkResponse({ description: '', type: [RecommendationDto] })
  findUserRecommendations(
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.recommendationsService.getRecommendations(userId, page, limit);
  }
}
