import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ContentsService } from './contents.service';
import { CreateContentDto } from './dto/create-content.dto';
import { ValidationPipe } from '../shared/validation.pipe'; 
import { FilterContentDto } from './dto/filter-content.dto';

@ApiTags('contents')
@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new content' })
  @ApiResponse({ status: 201, description: 'Content successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiBody({ type: CreateContentDto })
  async create(@Body(new ValidationPipe()) createContentDto: CreateContentDto) {
    return await this.contentsService.create(createContentDto);
  }

  @Get('filter')
  @ApiOperation({ summary: 'Filter contents based on criteria' })
  @ApiResponse({ status: 200, description: 'Filtered contents retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiBody({ type: FilterContentDto })
  async filterContent(@Body(new ValidationPipe()) filterContentDto: FilterContentDto) {
    const { type, tags, page, pageSize } = filterContentDto;
    const tagsArray = tags ? tags.split(',') : undefined;
    return await this.contentsService.filterContents(type, tagsArray, page, pageSize);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a content by ID' })
  @ApiResponse({ status: 200, description: 'Content successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Content not found.' })
  @ApiParam({ name: 'id', description: 'ID of the content to delete' })
  async remove(@Param('id') id: string) {
    return await this.contentsService.remove(id);
  }
}