import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { ValidationPipe } from '../shared/validation.pipe';

@ApiTags('interactions')
@Controller('interactions')
export class InteractionsController {
  constructor(private readonly service: InteractionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new interaction' })
  @ApiResponse({ status: 201, description: 'The interaction has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiHeader({ name: 'x-apikey', description: 'API key for authentication', required: true })
  create(@Body(new ValidationPipe()) dto: CreateInteractionDto) {
    return this.service.create(dto);
  }
}
