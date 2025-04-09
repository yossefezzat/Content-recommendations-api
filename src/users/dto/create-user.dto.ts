import { IsString, IsNotEmpty, ArrayNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentTags } from '../../contents/constants/content-tags.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The preferences of the user, represented as an array of content tags',
    example: ['TECH', 'SPORTS'],
    isArray: true,
    enum: ContentTags,
  })
  @ArrayNotEmpty()
  @IsIn(Object.values(ContentTags), { each: true })
  preferences: ContentTags[];
}
