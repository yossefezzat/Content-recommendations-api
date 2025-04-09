import { IsString, IsArray, ArrayNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../constants/content-type.enum';
import { ContentTags } from '../constants/content-tags.enum';

export class CreateContentDto {
  @ApiProperty({
    description: 'The title of the content',
    example: 'Introduction to TypeScript',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The type of the content',
    enum: ContentType,
    example: ContentType.ARTICLE,
  })
  @IsIn(Object.values(ContentType))
  type: ContentType;

  @ApiProperty({
    description: 'Tags associated with the content',
    isArray: true,
    enum: ContentTags,
    example: [ContentTags.BUSINESS, ContentTags.TECHNOLOGY],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(Object.values(ContentTags), { each: true })
  tags: ContentTags[];
}
