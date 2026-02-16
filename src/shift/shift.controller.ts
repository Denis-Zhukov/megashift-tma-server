import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { Request } from 'express';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ClaimsGuard } from '../guards/claims.guard';
import { RequireClaims } from '../common/require-claims.decorator';
import { AccessClaim } from '../types';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftsService: ShiftService) {}

  @Get()
  @UseGuards(ClaimsGuard)
  @RequireClaims(AccessClaim.READ)
  async findAll(
    @Req() req: Request,
    @Query('ownerId') ownerId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.shiftsService.findByMonth({
      userId: req.user.id,
      ownerId,
      year: Number(year),
      month: Number(month),
    });
  }

  @Get('date')
  @UseGuards(ClaimsGuard)
  @RequireClaims(AccessClaim.READ)
  async findByDay(
    @Query('ownerId') ownerId: string,
    @Query('date') date: string,
  ) {
    return this.shiftsService.findByDay({
      ownerId: ownerId,
      dateStr: date,
    });
  }

  @Post()
  @UseGuards(ClaimsGuard)
  @RequireClaims(AccessClaim.EDIT_SELF, AccessClaim.EDIT_OWNER)
  async create(
    @Req() req: Request,
    @Query('ownerId') ownerId: string,
    @Body() dto: CreateShiftDto,
  ) {
    return this.shiftsService.create({
      ownerId,
      userId: req.user.id,
      dto,
    });
  }

  @Patch(':id')
  @UseGuards(ClaimsGuard)
  @RequireClaims(AccessClaim.EDIT_SELF, AccessClaim.EDIT_OWNER)
  async update(
    @Req() req: Request,
    @Query('ownerId') ownerId: string,
    @Param('id') shiftId: string,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.shiftsService.update({
      ownerId,
      shiftId,
      dto,
      userId: req.user.id,
    });
  }

  @UseGuards(ClaimsGuard)
  @RequireClaims(AccessClaim.DELETE_SELF, AccessClaim.DELETE_OWNER)
  @Delete(':id')
  async delete(
    @Req() req: Request,
    @Query('ownerId') ownerId: string,
    @Param('id') shiftId: string,
  ) {
    return this.shiftsService.delete({
      shiftId,
      ownerId,
      userId: req.user.id,
      claims: req.user.claims,
    });
  }
}
