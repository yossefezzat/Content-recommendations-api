import { Interaction } from '../../interactions/entities/interaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ContentType } from '../constants/content-type.enum';
  
@Entity()
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: ContentType;

  @Column('simple-array')
  tags: string[];

  @Column({ default: 0 })
  popularity: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Interaction, interaction => interaction.content)
  interactions: Interaction[];
}
  