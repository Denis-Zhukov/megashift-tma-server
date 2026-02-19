import { Module } from '@nestjs/common';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SettingController],
  providers: [SettingService, PrismaService],
})
export class SettingModule {}
