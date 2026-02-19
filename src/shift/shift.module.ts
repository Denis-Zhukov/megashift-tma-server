import { Module } from '@nestjs/common';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [ShiftController],
  providers: [ShiftService, PrismaService],
})
export class ShiftModule {}
