import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ClaimsGuard } from '../utils/guards/claims.guard';
import { RequireClaims } from '../utils/decorators/require-claims.decorator';
import { AccessClaim } from '../types';
import { OwnerId } from '../utils/decorators/owner-id.decorator';
import { GetMonthYearDto } from './dto/get-month-year.dto';

@UseGuards(ClaimsGuard)
@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticsService: StatisticService) {}

  @RequireClaims(AccessClaim.READ_STATISTICS)
  @Get('shifts')
  async getShiftStatistics(
    @OwnerId() ownerId: string,
    @Query() query: GetMonthYearDto,
  ) {
    return this.statisticsService.getShiftsByTemplate(
      ownerId,
      query.year,
      query.month,
    );
  }

  @RequireClaims(AccessClaim.READ_STATISTICS)
  @Get('shifts/hours')
  async getShiftHoursStatistics(
    @OwnerId() ownerId: string,
    @Query() query: GetMonthYearDto,
  ) {
    return this.statisticsService.getShiftsHoursByTemplate(
      ownerId,
      query.year,
      query.month,
    );
  }

  @RequireClaims(AccessClaim.READ_STATISTICS)
  @Get('salary')
  async getSalary(@OwnerId() ownerId: string, @Query() query: GetMonthYearDto) {
    return this.statisticsService.getSalaryForMonth(
      ownerId,
      query.year,
      query.month,
    );
  }
}
