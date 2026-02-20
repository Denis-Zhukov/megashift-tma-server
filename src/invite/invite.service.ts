import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisClientType } from 'redis';
import { randomUUID } from 'crypto';
import { AccessClaim } from '../types';

type InviteObject = {
  type: 'invite';
  payload: {
    inviterId: string;
    claims: AccessClaim[];
  };
};

@Injectable()
export class InviteService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  async createInvite(inviterId: string, claims: AccessClaim[]) {
    const ttlSeconds = 60 * 60;
    const inviteSetKey = `invite:set:${inviterId}`;
    const currentCount = await this.redis.sCard(inviteSetKey);

    if (currentCount >= 5) {
      throw new BadRequestException(
        'Достигнут лимит ссылок на приглашение, попробуйте позже',
      );
    }

    const id = randomUUID();
    const inviteKey = `invite:${id}`;

    const inviteData: InviteObject = {
      type: 'invite',
      payload: { inviterId, claims },
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
      select: { name: true, surname: true, patronymic: true },
    });

    return {
      inviter,
      claims: invite.payload.claims,
      exists: true,
    };
  }

  async consumeInvite(inviteId: string, consumerId: string) {
    const inviteKey = `invite:${inviteId}`;
    const data = await this.redis.get(inviteKey);
    if (typeof data !== 'string')
      throw new Error('Invite not found or already consumed');

    const { inviterId, claims } = JSON.parse(data).payload;
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
}
