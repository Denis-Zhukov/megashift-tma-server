import {
  Controller,
  Get,
  Patch,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  CurrentUser,
  AuthUser,
} from '../utils/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.id, dto);
  }
}
