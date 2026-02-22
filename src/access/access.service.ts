import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GrantAccessDto } from './dto/grant-access.dto';
import { RevokeAccessDto } from './dto/revoke-access.dto';
import { AccessClaim } from '@prisma/client';

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async grantAccess(ownerId: string, dto: GrantAccessDto) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    const result = await this.prisma.userAccess.createMany({
      data: dto.claims.map((claim) => ({
        ownerId,
        grantedToId: dto.targetUserId,
        claim,
      })),
      skipDuplicates: true,
    });

    return {
      grantedClaims: result.count,
    };
  }

  async revokeAccess(ownerId: string, dto: RevokeAccessDto) {
    const result = await this.prisma.userAccess.deleteMany({
      where: {
        ownerId,
        grantedToId: dto.targetUserId,
        claim: { in: dto.claims },
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('No matching access records found');
    }

    return {
      revokedClaims: result.count,
    };
  }

  async revokeAllAccess(ownerId: string, targetUserId: string) {
    const result = await this.prisma.userAccess.deleteMany({
      where: {
        ownerId,
        grantedToId: targetUserId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('No access found to revoke');
    }

    return {
      revokedAll: true,
      deletedRecords: result.count,
    };
  }

  async getAvailableCalendars(userId: string) {
    const records = await this.prisma.userAccess.findMany({
      where: { grantedToId: userId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            surname: true,
            patronymic: true,
          },
        },
      },
    });

    const grouped = records.reduce<
      Record<
        string,
        {
          id: string;
          name: string;
          surname: string;
          patronymic: string | null;
          claims: AccessClaim[];
        }
      >
    >((acc, record) => {
      const ownerId = record.owner.id;

      if (!acc[ownerId]) {
        acc[ownerId] = {
          id: record.owner.id,
          name: record.owner.name,
          surname: record.owner.surname,
          patronymic: record.owner.patronymic,
          claims: [],
        };
      }

      acc[ownerId].claims.push(record.claim);

      return acc;
    }, {});

    return Object.values(grouped);
  }

  async getUserClaims(ownerId: string, userId: string) {
    const claims = await this.prisma.userAccess.findMany({
      where: { ownerId, grantedToId: userId },
      select: { claim: true },
    });

    return claims.map((c) => c.claim);
  }
}
