import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../redis/redis.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [RedisModule, UserModule],
  controllers: [InviteController],
  providers: [InviteService, PrismaService],
  exports: [InviteService],
})
export class InviteModule {}