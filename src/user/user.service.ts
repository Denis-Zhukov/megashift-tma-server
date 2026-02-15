import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'crypto';
import { RedisClientType } from 'redis';

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

  async getInvite(id: string) {
    const inviteKey = `invite:${id}`;
    const data = await this.redis.get(inviteKey);

    if (typeof data !== 'string') return null;

    return JSON.parse(data);
  }

  async createInvite(inviterId: string) {
    const ttlSeconds = 60 * 60;
    const inviteSetKey = `invite:set:${inviterId}`;
    const currentCount = await this.redis.sCard(inviteSetKey);

    if (currentCount >= 5) {
      throw new Error('Invite limit exceeded');
    }

    const id = randomUUID();
    const inviteKey = `invite:${id}`;

    const inviteData = {
      type: 'invite',
      payload: {
        inviterId,
        access: 'view',
      },
    };

    const result = await this.redis
      .multi()
      .set(inviteKey, JSON.stringify(inviteData), { EX: ttlSeconds })
      .sAdd(inviteSetKey, id)
      .expire(inviteSetKey, ttlSeconds)
      .exec();

    if (!result) throw new Error('Failed to create invite');

    return { id };
  }

  async consumeInvite(inviteId: string, consumerId: string) {
    const inviteKey = `invite:${inviteId}`;

    const data = await this.redis.get(inviteKey);
    if (typeof data !== 'string') {
      throw new Error('Invite not found or already consumed');
    }

    const inviteData = JSON.parse(data);
    const inviterId = inviteData.payload.inviterId;
    const inviteSetKey = `invite:set:${inviterId}`;

    const results = await this.redis
      .multi()
      .del(inviteKey)
      .sRem(inviteSetKey, inviteId)
      .exec();

    if (!results) {
      throw new Error('Invite conflict: already consumed by someone else');
    }

    return {
      success: true,
      type: inviteData.type,
      payload: inviteData.payload,
    };
  }
}
