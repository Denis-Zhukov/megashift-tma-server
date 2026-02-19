import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService, PrismaService],
  imports: [UserModule],
})
export class StatisticsModule {}
