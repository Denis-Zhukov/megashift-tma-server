import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Delete,
  Param,
  Patch,
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
    @Query('ownerId') ownerId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.shiftsService.findByMonth(ownerId, Number(year), Number(month));
  }

  @Get('date')
  async findByDay(@Req() req: Request, @Query('date') date: string) {
    return this.shiftsService.findByDay(req.user.id, date);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateShiftDto) {
    return this.shiftsService.create(req.user.id, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.shiftsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.shiftsService.delete(req.user.id, id);
  }
}
