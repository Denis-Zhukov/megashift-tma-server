import { Controller, Get, Post, Body } from '@nestjs/common';
import { AccessService } from './access.service';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { GrantAccessDto } from './dto/grant-access.dto';

@Controller('users/access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Get('available-calendars')
  async getAccess(@CurrentUser() user: AuthUser) {
    return this.accessService.getAvailableCalendars(user.id);
  }

  @Post('grant')
  async grantAccess(@CurrentUser() user: AuthUser, @Body() dto: GrantAccessDto) {
    return this.accessService.grantAccess(user.id, dto);
  }
}