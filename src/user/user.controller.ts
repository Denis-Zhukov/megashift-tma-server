import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GrantAccessDto } from './dto/grant-access.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
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

  @Post('invite')
  async createInvite(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInviteDto,
  ) {
    return this.userService.createInvite(user.id, dto.claims);
  }

  @Get('invite/:id')
  async getInvite(@Param('id', ParseUUIDPipe) id: string) {
    const invite = await this.userService.getInvite(id);
    if (!invite) throw new NotFoundException({exists: false});

    return {
      ...invite,
      exists: true,
    };
  }

  @Post('invite/:id/consume')
  async consumeInvite(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.userService.consumeInvite(id, user.id);
  }

  @Get('available-calendars')
  async getAccess(@CurrentUser() user: AuthUser) {
    return this.userService.getAvailableCalendars(user.id);
  }

  @Post('access/grant')
  async grantAccess(
    @CurrentUser() user: AuthUser,
    @Body() dto: GrantAccessDto,
  ) {
    return this.userService.grantAccess(user.id, dto);
  }
}
