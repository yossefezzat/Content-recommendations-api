import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Interaction } from '../../interactions/entities/interaction.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({ description: 'Unique identifier for the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
  @Column()
  username: string;

  @ApiProperty({ description: 'List of user preferences', example: ['sports', 'technology'] })
  @Column('simple-array')
  preferences: string[];

  @ApiProperty({ description: 'List of interactions associated with the user', type: () => [Interaction] })
  @OneToMany(() => Interaction, interaction => interaction.user)
  interactions: Interaction[];
}