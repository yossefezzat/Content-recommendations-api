import { IsIn, IsUUID, IsInt, Min, Max, ValidateIf } from 'class-validator';
import { InteractionType } from '../constants/interaction-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInteractionDto {
  @ApiProperty({
    description: 'The UUID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'The UUID of the content',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  contentId: string;

  @ApiProperty({
    description: 'The type of interaction',
    enum: InteractionType,
    example: InteractionType.LIKE,
  })
  @IsIn(Object.values(InteractionType))
  type: InteractionType;

  @ApiPropertyOptional({
    description: 'The rating given by the user (only required for RATE type)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @ValidateIf((o) => o.type === InteractionType.RATE)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
