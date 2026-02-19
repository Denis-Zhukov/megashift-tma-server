import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { AuthUser, CurrentUser } from '../utils/decorators/current-user.decorator';
import { CreateInviteDto } from './dto/create-invite.dto';

@Controller('users/invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post()
  async createInvite(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInviteDto,
  ) {
    return this.inviteService.createInvite(user.id, dto.claims);
  }

  @Get(':id')
  async getInvite(@Param('id', ParseUUIDPipe) id: string) {
    const invite = await this.inviteService.getInvite(id);
    if (!invite) throw new NotFoundException({ exists: false });
    return invite;
  }

  @Post(':id/consume')
  async consumeInvite(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.inviteService.consumeInvite(id, user.id);
  }
}
