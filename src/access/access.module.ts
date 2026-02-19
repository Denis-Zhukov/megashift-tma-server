import { Module } from '@nestjs/common';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AccessController],
  providers: [AccessService, PrismaService],
  exports: [AccessService],
})
export class AccessModule {}