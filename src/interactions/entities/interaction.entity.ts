import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Content } from '../../contents/entities/content.entity';
import { InteractionType } from '../constants/interaction-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Interaction {
  @ApiProperty({ description: 'Unique identifier for the interaction', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Type of interaction', enum: InteractionType, example: InteractionType.LIKE })
  @Column({ type: 'text', enum: InteractionType })
  type: InteractionType;

  @ApiProperty({ description: 'Rating given by the user (optional)', example: 4, nullable: true })
  @Column({ nullable: true })
  rating?: number;

  @ApiProperty({ description: 'Timestamp of the interaction', example: '2023-01-01T12:00:00Z' })
  @CreateDateColumn()
  timestamp: Date;

  @ApiProperty({ description: 'User who performed the interaction', type: () => User })
  @ManyToOne(() => User, user => user.interactions, { onDelete: 'CASCADE' })
  user: User;

  @ApiProperty({ description: 'Content associated with the interaction', type: () => Content })
  @ManyToOne(() => Content, content => content.interactions, { onDelete: 'CASCADE' })
  content: Content;
}