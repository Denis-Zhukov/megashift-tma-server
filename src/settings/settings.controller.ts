import { Controller, Patch, Body, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { Request } from 'express';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Patch('salary')
  async updateSalary(@Req() req: Request, @Body() dto: UpdateSalaryDto) {
    return this.settingsService.updateSalary(req.user.id, dto);
  }
}
