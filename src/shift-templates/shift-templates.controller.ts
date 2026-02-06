import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ShiftTemplatesService } from './shift-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Request } from 'express';

@Controller('shift-templates')
export class ShiftTemplatesController {
  constructor(private readonly shiftTemplatesService: ShiftTemplatesService) {}

  @Get()
  getByUser(@Req() req: Request) {
    return this.shiftTemplatesService.getTemplatesByUserId(req.user.id);
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
