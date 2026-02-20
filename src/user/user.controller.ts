import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  AuthUser,
  CurrentUser,
} from '../utils/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @CurrentUser() user: AuthUser,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService.create(user.id, createUserDto);
  }

  @Get('check-registration')
  async checkRegistration(@CurrentUser() user: AuthUser) {
    return this.userService.getById(user.id);
  }
}
