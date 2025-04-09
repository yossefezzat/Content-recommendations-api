import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContentDto {
  @ApiPropertyOptional({
    description: 'The popularity score of the content',
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  popularity?: number;
}