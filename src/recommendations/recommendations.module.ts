import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { UsersModule } from '../users/users.module';
import { ContentsModule } from '../contents/contents.module';
import { InteractionsModule } from '../interactions/interactions.module';
import { CacheStoreModule } from '../cache-store/cache-store.module';

@Module({
  imports: [UsersModule, ContentsModule, InteractionsModule, CacheStoreModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
