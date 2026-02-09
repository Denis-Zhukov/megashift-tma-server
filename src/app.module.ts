import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { ShiftTemplatesModule } from './shift-templates/shift-templates.module';
import { ShiftModule } from './shift/shift.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PrismaModule,
    ProfileModule,
    ShiftTemplatesModule,
    ShiftModule,
    StatisticsModule,
  ],
})
export class AppModule {}
