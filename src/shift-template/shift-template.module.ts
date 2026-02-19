import { Module } from '@nestjs/common';
import { ShiftTemplateService } from './shift-template.service';
import { ShiftTemplateController } from './shift-template.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  providers: [ShiftTemplateService, PrismaService],
  controllers: [ShiftTemplateController],
})
export class ShiftTemplateModule {}
