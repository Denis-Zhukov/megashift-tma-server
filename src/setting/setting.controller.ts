import { Controller, Patch, Body, Req, Get } from '@nestjs/common';
import { SettingService } from './setting.service';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { Request } from 'express';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingsService: SettingService) {}

  @Patch('salary')
  async updateSalary(@Req() req: Request, @Body() dto: UpdateSalaryDto) {
    return this.settingsService.updateSalary(req.user.id, dto);
  }

  @Get()
  async getSettings(@Req() req: Request) {
    return this.settingsService.getSettings(req.user.id);
  }
}
