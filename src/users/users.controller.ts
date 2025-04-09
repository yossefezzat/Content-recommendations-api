import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidationPipe } from '../shared/validation.pipe';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiHeader({ name: 'x-apikey', description: 'API key for authentication', required: true })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiBody({ type: CreateUserDto })
  create(@Body(new ValidationPipe()) dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })  
  @ApiHeader({ name: 'x-apikey', description: 'API key for authentication', required: true })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully.' })
  findAll() {
    return this.userService.findAll();
  }
}
