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
  CurrentUser,
  AuthUser,
} from '../utils/decorators/current-user.decorator';
import { UpdateAccessDto } from './dto/update-access.dto';

@Controller('users/access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Get('/granted-users')
  async getGrantedUsers(@CurrentUser() user: AuthUser) {
    return this.accessService.getGrantedUsers(user.id);
  }

  @Get('/available-calendars')
  async getAvailableCalendars(@CurrentUser() user: AuthUser) {
    return this.accessService.getAvailableCalendars(user.id);
  }

  @Post('/update')
  async updateAccess(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAccessDto,
  ) {
    if (user.id === dto.targetUserId) {
      throw new BadRequestException('Cannot update access for yourself');
    }
    return this.accessService.updateAccess(user.id, dto);
  }

  @Delete(':targetUserId')
  async revokeAllAccess(
    @CurrentUser() user: AuthUser,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.accessService.revokeAllAccess(user.id, targetUserId);
  }
}
