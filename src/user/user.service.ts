import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'crypto';
import { RedisClientType } from 'redis';
import { GrantAccessDto } from './dto/grant-access.dto';
import { AccessClaim } from '../types';

type InviteObject = {
  type: 'invite';
  payload: {
    inviterId: string;
    claims: AccessClaim[];
  };
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  async getById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        surname: true,
        patronymic: true,
        timezone: true,
      },
    });
  }

  async create(userId: string, createUserDto: CreateUserDto) {
    const createdUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        id: userId,
      },
    });

    return {
      id: createdUser,
      name: createdUser.name,
      surname: createdUser.surname,
      patronymic: createdUser.patronymic,
      createdAt: createdUser.createdAt,
      timezone: createdUser.timezone,
    };
  }

  async createInvite(inviterId: string, claims: AccessClaim[]) {
    const ttlSeconds = 60 * 60;
    const inviteSetKey = `invite:set:${inviterId}`;
    const currentCount = await this.redis.sCard(inviteSetKey);

    if (currentCount >= 5) {
      throw new BadRequestException('Invite limit exceeded');
    }

    const id = randomUUID();
    const inviteKey = `invite:${id}`;

    const inviteData: InviteObject = {
      type: 'invite',
      payload: {
        inviterId,
        claims,
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

  async getInvite(id: string) {
    const inviteKey = `invite:${id}`;
    const data = await this.redis.get(inviteKey);

    if (typeof data !== 'string') return null;

    const invite = JSON.parse(data) as InviteObject;

    const inviter = await this.prisma.user.findUnique({
      where: { id: invite.payload.inviterId },
      select: {
        surname: true,
        name: true,
        patronymic: true,
      },
    });

    return {
      inviter: {
        surname: inviter.surname,
        name: inviter.name,
        patronymic: inviter.patronymic,
      },
      claims: invite.payload.claims,
    };
  }

  async consumeInvite(inviteId: string, consumerId: string) {
    const inviteKey = `invite:${inviteId}`;
    const data = await this.redis.get(inviteKey);

    if (typeof data !== 'string') {
      throw new Error('Invite not found or already consumed');
    }

    const {
      payload: { inviterId, claims },
    } = JSON.parse(data) as InviteObject;
    const inviteSetKey = `invite:set:${inviterId}`;

    const results = await this.redis
      .multi()
      .del(inviteKey)
      .sRem(inviteSetKey, inviteId)
      .exec();

    if (!results) throw new Error('Invite conflict: already consumed');

    for (const claim of claims) {
      await this.prisma.userAccess.upsert({
        where: {
          ownerId_grantedToId_claim: {
            ownerId: inviterId,
            grantedToId: consumerId,
            claim: claim as any,
          },
        },
        update: {},
        create: {
          ownerId: inviterId,
          grantedToId: consumerId,
          claim: claim as any,
        },
      });
    }

    return { success: true };
  }

  async grantAccess(ownerId: string, { targetUserId, claims }: GrantAccessDto) {
    const results = [];
    for (const claim of claims) {
      const access = await this.prisma.userAccess.upsert({
        where: {
          ownerId_grantedToId_claim: {
            ownerId,
            grantedToId: targetUserId,
            claim: claim as any,
          },
        },
        update: {},
        create: {
          ownerId,
          grantedToId: targetUserId,
          claim: claim as any,
        },
      });
      results.push(access);
    }

    return results;
  }

  async getAccessForUser(ownerId: string) {
    return this.prisma.userAccess.findMany({
      where: { ownerId },
      include: {
        grantedTo: { select: { id: true, name: true, surname: true } },
      },
    });
  }

  async checkUserClaim(ownerId: string, userId: string, claim: string) {
    const access = await this.prisma.userAccess.findFirst({
      where: {
        ownerId,
        grantedToId: userId,
        claim: claim as any,
      },
    });
    return !!access;
  }
}
