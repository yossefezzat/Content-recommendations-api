import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Interaction } from '../entities/interaction.entity';
import { InteractionType } from '../constants/interaction-type.enum';

@Injectable()
export class InteractionRepository extends Repository<Interaction> {
  constructor(private readonly dataSource: DataSource) {
    super(Interaction, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Interaction[]> {
    return this.find({
      where: { user: { id: userId } },
      relations: ['user', 'content'],
    });
  }

  async findByContentId(contentId: string): Promise<Interaction[]> {
    return this.find({
      where: { content: { id: contentId } },
      relations: ['user', 'content'],
    });
  }

  async countByType(contentId: string, type: InteractionType): Promise<number> {
    return this.count({
      where: {
        content: { id: contentId },
        type: type,
      },
    });
  }

  async getAverageRating(contentId: string): Promise<number> {
    const result = await this.createQueryBuilder('interaction')
      .select('AVG(interaction.rating)', 'avg')
      .where('interaction.contentId = :contentId', { contentId })
      .andWhere('interaction.type = :type', { type: 'rate' })
      .getRawOne();

    return parseFloat(result.avg) || 0;
  }
}
