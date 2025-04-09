import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { ContentRepository } from './repositories/content.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { InteractionsModule } from '../interactions/interactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Content])],
  controllers: [ContentsController],
  providers: [ContentsService, ContentRepository],
  exports: [ContentsService],
})
export class ContentsModule {}
