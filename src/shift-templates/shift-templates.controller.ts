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
import { ShiftTemplatesService } from './shift-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Request } from 'express';
import { ClaimsGuard } from '../guards/claims.guard';
import { RequireClaims } from '../common/require-claims.decorator';
import { AccessClaim } from '../types';

@Controller('shift-templates')
export class ShiftTemplatesController {
  constructor(private readonly shiftTemplatesService: ShiftTemplatesService) {}

  @Get()
  @UseGuards(ClaimsGuard)
  @RequireClaims(AccessClaim.READ)
  getByUserId(@Query('ownerId') ownerId: string) {
    return this.shiftTemplatesService.getByUserId(ownerId);
  }

  @Get(':id')
  getById(@Req() req: Request, @Param('id') id: string) {
    return this.shiftTemplatesService.getTemplateByUserIdAndById(
      req.user.id,
      id,
    );
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateTemplateDto) {
    return this.shiftTemplatesService.createTemplateByUserId(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.shiftTemplatesService.updateTemplate(req.user.id, id, dto);
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id') id: string) {
    return this.shiftTemplatesService.deleteTemplate(req.user.id, id);
  }
}
