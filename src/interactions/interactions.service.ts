import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interaction } from './entities/interaction.entity';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UsersService } from '../users/users.service';
import { ContentsService } from '../contents/contents.service';
import { InteractionRepository } from './repositories/interactions.repository';
import { InteractionType } from './constants/interaction-type.enum';
import * as _ from 'lodash';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Interaction)
    private interactionRepository: InteractionRepository,
    private usersService: UsersService,
    private contentsService: ContentsService,
  ) {}

  async create(dto: CreateInteractionDto): Promise<Interaction> {
    const { userId, contentId, type, rating } = dto;

    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    const content = await this.contentsService.findOne(contentId);
    if (!content) throw new NotFoundException('Content not found');

    if (type === InteractionType.RATE && (rating === null || rating === undefined)) {
      throw new BadRequestException('Rating is required for type "rate"');
    }

    const existingInteraction = await this.interactionRepository.findOne({
      where: {
        user: { id: userId },
        content: { id: contentId },
        type,
      },
    });

    if (existingInteraction) {
      throw new ConflictException('Interaction of this type already exists for this user and content');
    }

    const interactionData = this.filterInteractionsData(dto);
    const interaction = this.interactionRepository.create({
      ...interactionData,
      user,
      content,
    });

    const savedInteraction = await this.interactionRepository.save(interaction);
    return savedInteraction;
  }

  filterInteractionsData(createdInteraction: CreateInteractionDto): Interaction {
    return _.pick(createdInteraction, ['userId', 'contentId', 'type', ...(createdInteraction.type === InteractionType.RATE ? ['rating'] : [])]);

  }

  async findByContentId(contentId: string): Promise<Interaction[]> {
    if(contentId === null || contentId === undefined) {
      throw new BadRequestException('Content ID is required');
    }
    await this.contentsService.findOne(contentId)
    
    return this.interactionRepository.find({ where: { content: { id: contentId } } });
  }

  async updateContentPopularity(contentId: string): Promise<void> {
    const interactions = await this.findByContentId(contentId);
  
    const shares = interactions.filter(i => i.type === InteractionType.SHARE).length;
    const likes = interactions.filter(i => i.type === InteractionType.LIKE).length;
    const comments = interactions.filter(i => i.type === InteractionType.COMMENT ).length;
    const ratings = interactions
      .filter(i => i.type === InteractionType.RATE && i.rating)
      .map(i => i.rating!);
  
    const newPopularity = this.contentsService.calculatePopularity({ shares, likes, comments, ratings });
  
    await this.contentsService.updateContent(contentId, { popularity: Math.floor(newPopularity) });
  }

  getUserRelevantInteractions(userId: string) {
    return this.interactionRepository.find({ where: { user: { id: userId } }, relations: ['content'] });
  }
}
