import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserService, AccessClaim } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { GrantAccessDto } from './dto/grant-access.dto';

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
    const invite = await this.userService.getInvite(id);
    if (!invite) return { exists: false };

    return {
      exists: true,
      invite,
    };
  }

  @Post('invite/:id/consume')
  async consumeInvite(@Param('id') id: string, @Req() req: Request) {
    return this.userService.consumeInvite(id, req.user.id);
  }

  @Get('access')
  async getAccess(@Req() req: Request) {
    return this.userService.getAccessForUser(req.user.id);
  }

  @Post('access/grant')
  async grantAccess(@Req() req: Request, @Body() dto: GrantAccessDto) {
    return this.userService.grantAccess(req.user.id, dto);
  }
}
