import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { ShiftTemplateModule } from './shift-template/shift-template.module';
import { ShiftModule } from './shift/shift.module';
import { StatisticModule } from './statistic/statistic.module';
import { SettingModule } from './setting/setting.module';
import { AccessModule } from './access/access.module';
import { InviteModule } from './invite/invite.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    AccessModule,
    InviteModule,
    ProfileModule,
    ShiftModule,
    ShiftTemplateModule,
    StatisticModule,
    SettingModule,
  ],
})
export class AppModule {}
