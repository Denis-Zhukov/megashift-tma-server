import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ClaimsGuard } from '../guards/claims.guard';
import { RequireClaims } from '../common/require-claims.decorator';
import { AccessClaim } from '../types';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { OwnerId } from '../common/owner-id.decorator';
import { FindShiftsQueryDto } from './dto/find-shift-query.dto';
import { FindShiftByDayDto } from './dto/find-shift-by-day.dto';

@UseGuards(ClaimsGuard)
@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get('by-month')
  @RequireClaims(AccessClaim.READ)
  async findByMonth(
    @CurrentUser() user: AuthUser,
    @OwnerId() ownerId: string,
    @Query() query: FindShiftsQueryDto,
  ) {
    return this.shiftService.findByMonth({
      userId: user.id,
      ownerId,
      year: query.year,
      month: query.month,
    });
  }

  @Get('by-date')
  @RequireClaims(AccessClaim.READ)
  async findByDate(
    @OwnerId() ownerId: string,
    @Query() query: FindShiftByDayDto,
  ) {
    return this.shiftService.findByDate({
      ownerId,
      dateStr: query.date,
    });
  }

  @Post()
  @RequireClaims(AccessClaim.EDIT_SELF, AccessClaim.EDIT_ALL)
  async create(
    @CurrentUser() user: AuthUser,
    @OwnerId() ownerId: string,
    @Body() dto: CreateShiftDto,
  ) {
    return this.shiftService.create({
      ownerId,
      userId: user.id,
      dto,
    });
  }

  @Patch(':id')
  @RequireClaims(AccessClaim.EDIT_SELF, AccessClaim.EDIT_ALL)
  async update(
    @CurrentUser() user: AuthUser,
    @OwnerId() ownerId: string,
    @Param('id', ParseUUIDPipe) shiftId: string,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.shiftService.update({
      ownerId,
      shiftId,
      dto,
      userId: user.id,
      claims: user.claims,
    });
  }

  @RequireClaims(AccessClaim.DELETE_SELF, AccessClaim.DELETE_ALL)
  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthUser,
    @OwnerId() ownerId: string,
    @Param('id', ParseUUIDPipe) shiftId: string,
  ) {
    return this.shiftService.delete({
      shiftId,
      ownerId,
      userId: user.id,
      claims: user.claims,
    });
  }
}
