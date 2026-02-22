import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AccessService } from './access.service';
import {
  AuthUser,
  CurrentUser,
} from '../utils/decorators/current-user.decorator';
import { GrantAccessDto } from './dto/grant-access.dto';
import { RevokeAccessDto } from './dto/revoke-access.dto';

@Controller('users/access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Get()
  async getAvailableCalendars(@CurrentUser() user: AuthUser) {
    return this.accessService.getAvailableCalendars(user.id);
  }

  @Post()
  async grantAccess(
    @CurrentUser() user: AuthUser,
    @Body() dto: GrantAccessDto,
  ) {
    if (user.id === dto.targetUserId) {
      throw new BadRequestException('Cannot grant access to yourself');
    }

    return this.accessService.grantAccess(user.id, dto);
  }

  @Delete()
  async revokeAccess(
    @CurrentUser() user: AuthUser,
    @Body() dto: RevokeAccessDto,
  ) {
    return this.accessService.revokeAccess(user.id, dto);
  }

  @Delete(':targetUserId')
  async revokeAllAccess(
    @CurrentUser() user: AuthUser,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.accessService.revokeAllAccess(user.id, targetUserId);
  }
}
