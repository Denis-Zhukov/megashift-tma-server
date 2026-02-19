import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GrantAccessDto } from './dto/grant-access.dto';

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

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
        create: { ownerId, grantedToId: targetUserId, claim: claim as any },
      });
      results.push(access);
    }
    return results;
  }

  async getAvailableCalendars(userId: string) {
    const accessRecords = await this.prisma.userAccess.findMany({
      where: { grantedToId: userId },
      include: {
        owner: {
          select: { id: true, name: true, surname: true, patronymic: true },
        },
      },
    });

    const grouped: Record<
      string,
      {
        id: string;
        name: string;
        surname: string;
        patronymic?: string;
        claims: string[];
      }
    > = {};
    for (const record of accessRecords) {
      const owner = record.owner;
      if (!grouped[owner.id]) {
        grouped[owner.id] = {
          id: owner.id,
          name: owner.name,
          surname: owner.surname,
          patronymic: owner.patronymic,
          claims: [],
        };
      }
      grouped[owner.id].claims.push(record.claim);
    }

    return Object.values(grouped);
  }

  async getUserClaims(ownerId: string, userId: string) {
    const claims = await this.prisma.userAccess.findMany({
      where: { ownerId, grantedToId: userId },
      select: { claim: true },
    });
    return claims.map(({ claim }) => claim);
  }
}
