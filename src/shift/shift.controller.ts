import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Delete,
  Param,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { Request } from 'express';
import { CreateShiftDto } from './dto/create-shift.dto';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftsService: ShiftService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.shiftsService.findByMonth(
      req.user.id,
      Number(year),
      Number(month),
    );
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateShiftDto) {
    return this.shiftsService.create(req.user.id, dto);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.shiftsService.delete(req.user.id, id);
  }
}
