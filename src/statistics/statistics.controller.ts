import {
  Controller,
  Get,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Request } from 'express';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('shifts')
  async getShiftStatistics(
    @Req() req: Request,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (!parsedYear || !parsedMonth || parsedMonth < 1 || parsedMonth > 12) {
      throw new BadRequestException('Invalid year or month');
    }

    return this.statisticsService.getShiftsByTemplate(
      req.user.id,
      parsedYear,
      parsedMonth,
    );
  }

  @Get('shifts/hours')
  async getShiftHoursStatistics(
    @Req() req: Request,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (!parsedYear || !parsedMonth || parsedMonth < 1 || parsedMonth > 12) {
      throw new BadRequestException('Invalid year or month');
    }

    return this.statisticsService.getShiftsHoursByTemplate(
      req.user.id,
      parsedYear,
      parsedMonth,
    );
  }

  @Get('salary')
  async getSalary(
    @Req() req: Request,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (!parsedYear || !parsedMonth || parsedMonth < 1 || parsedMonth > 12) {
      throw new BadRequestException('Invalid year or month');
    }

    return this.statisticsService.getSalaryForMonth(
      (req.user as any).id,
      parsedYear,
      parsedMonth,
    );
  }
}
