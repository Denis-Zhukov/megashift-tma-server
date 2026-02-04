import { Module } from '@nestjs/common';
import { ShiftTemplatesService } from './shift-templates.service';
import { ShiftTemplatesController } from './shift-templates.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ShiftTemplatesService, PrismaService],
  controllers: [ShiftTemplatesController],
})
export class ShiftTemplatesModule {}
