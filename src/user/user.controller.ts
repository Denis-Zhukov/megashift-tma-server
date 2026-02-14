import { Controller, Post, Body, Req, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    return this.userService.create(req.user.id, createUserDto);
  }

  @Get('check-registration')
  async checkRegistration(@Req() req: Request) {
    return this.userService.getById(req.user.id);
  }

  @Post('invite')
  async createInvite(@Req() req: Request) {
    return this.userService.createInvite(req.user.id);
  }

  @Get('invite/:id')
  async getInvite(@Param('id') id: string) {
    return this.userService.getInvite(id);
  }
}
