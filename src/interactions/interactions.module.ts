import { Module } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import { InteractionRepository } from './repositories/interactions.repository';
import { Interaction } from './entities/interaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ContentsModule } from '../contents/contents.module';

@Module({
  imports: [UsersModule, ContentsModule, TypeOrmModule.forFeature([Interaction])],
  controllers: [InteractionsController],
  providers: [InteractionRepository, InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
