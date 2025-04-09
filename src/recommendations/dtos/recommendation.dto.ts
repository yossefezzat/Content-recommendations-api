import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../contents/constants/content-type.enum';
import { ContentTags } from '../../contents/constants/content-tags.enum';

export class RecommendationDto {
  @ApiProperty({ example: 'e58b0ed9-a722-4fac-b8e1-8329a57102c9' })
  id: string;

  @ApiProperty({ example: 'Laboriosam tibi xiphias sollicito...' })
  title: string;

  @ApiProperty({ enum: ContentType, example: ContentType.VIDEO })
  type: ContentType;

  @ApiProperty({ isArray: true, enum: ContentTags, example: [ContentTags.EDUCATION, ContentTags.FOOD] })
  tags: ContentTags[];

  @ApiProperty({ example: 0 })
  popularity: number;

  @ApiProperty({ type: String, example: '2025-04-07T04:27:32.805Z' })
  createdAt: Date;
}
