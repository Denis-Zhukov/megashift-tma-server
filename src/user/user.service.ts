import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'crypto';
import { RedisClientType, SetOptions } from 'redis';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  async getById(tgUserId: string) {
    return this.prisma.user.findUnique({
      where: { id: tgUserId },
      select: {
        name: true,
        surname: true,
        patronymic: true,
        timezone: true,
      },
    });
  }

  async create(tgUserId: string, createUserDto: CreateUserDto) {
    const createdUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        id: tgUserId,
      },
    });

    return {
      name: createdUser.name,
      surname: createdUser.surname,
      patronymic: createdUser.patronymic,
      createdAt: createdUser.createdAt,
      timezone: createdUser.timezone,
    };
  }

  async createInvite(inviterId: string) {
    const id = randomUUID();

    const inviteData = {
      type: 'invite',
      payload: {
        inviterId,
        access: 'view',
      },
    };

    await this.redis.set(id, JSON.stringify(inviteData), {
      expiration: {
        type: 'EX',
        value: 60 * 60,
      },
    } satisfies SetOptions);

    return { id };
  }

  async getInvite(id: string) {
    const data = await this.redis.get(id);

    if (typeof data !== 'string') {
      return null;
    }

    return JSON.parse(data);
  }
}
