import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ClaimsGuard } from '../guards/claims.guard';
import { RequireClaims } from '../common/require-claims.decorator';
import { AccessClaim } from '../types';
import { OwnerId } from '../common/owner-id.decorator';
import { GetMonthYearDto } from './dto/get-month-year.dto';

@UseGuards(ClaimsGuard)
@RequireClaims(AccessClaim.READ_STATISTICS)
@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticsService: StatisticService) {}

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

  @Get('salary')
  async getSalary(@OwnerId() ownerId: string, @Query() query: GetMonthYearDto) {
    return this.statisticsService.getSalaryForMonth(
      ownerId,
      query.year,
      query.month,
    );
  }
}
