import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [StatisticController],
  providers: [StatisticService, PrismaService],
})
export class StatisticModule {}
