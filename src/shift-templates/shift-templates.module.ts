import { Module } from '@nestjs/common';
import { ShiftTemplatesService } from './shift-templates.service';
import { ShiftTemplatesController } from './shift-templates.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [ShiftTemplatesService, PrismaService],
  controllers: [ShiftTemplatesController],
})
export class ShiftTemplatesModule {}
