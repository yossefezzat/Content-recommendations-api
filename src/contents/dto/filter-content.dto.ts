import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '../constants/content-type.enum';

export class FilterContentDto {
  @ApiPropertyOptional({
    description: 'Type of content',
    enum: ContentType,
  })
  @IsOptional()
  @IsIn(Object.values(ContentType))
  type?: ContentType;

  @ApiPropertyOptional({
    description: 'Comma-separated tags to filter content',
    example: 'tag1,tag2',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page for pagination',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}