import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAccessDto } from './dto/update-access.dto';
import { AccessClaim } from '@prisma/client';

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async updateAccess(ownerId: string, dto: UpdateAccessDto) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.targetUserId },
      select: { id: true },
    });
    if (!targetUser) throw new NotFoundException('Target user not found');

    const currentRecords = await this.prisma.userAccess.findMany({
      where: { ownerId, grantedToId: dto.targetUserId },
      select: { claim: true },
    });

    const currentClaims = currentRecords.map((r) => r.claim);

    const claimsToAdd = dto.claims.filter((c) => !currentClaims.includes(c));
    //@ts-expect-error - conflict Enums
    const claimsToRemove = currentClaims.filter((c) => !dto.claims.includes(c));

    await this.prisma.$transaction([
      ...claimsToAdd.map((claim) =>
        this.prisma.userAccess.create({
          data: { ownerId, grantedToId: dto.targetUserId, claim },
        }),
      ),
      ...(claimsToRemove.length
        ? [
            this.prisma.userAccess.deleteMany({
              where: {
                ownerId,
                grantedToId: dto.targetUserId,
                claim: { in: claimsToRemove },
              },
            }),
          ]
        : []),
    ]);

    return { added: claimsToAdd, removed: claimsToRemove };
  }

  // Полное удаление прав
  async revokeAllAccess(ownerId: string, targetUserId: string) {
    const result = await this.prisma.userAccess.deleteMany({
      where: { ownerId, grantedToId: targetUserId },
    });

    if (result.count === 0) {
      throw new NotFoundException('No access found to revoke');
    }

    return { revokedAll: true, deletedRecords: result.count };
  }

  // Получение всех пользователей, кому я дал доступ
  async getGrantedUsers(ownerId: string) {
    const records = await this.prisma.userAccess.findMany({
      where: { ownerId },
      include: {
        grantedTo: {
          select: { id: true, name: true, surname: true, patronymic: true },
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
      const userId = record.grantedTo.id;
      if (!acc[userId]) {
        acc[userId] = {
          id: record.grantedTo.id,
          name: record.grantedTo.name,
          surname: record.grantedTo.surname,
          patronymic: record.grantedTo.patronymic,
          claims: [],
        };
      }
      acc[userId].claims.push(record.claim);
      return acc;
    }, {});

    return Object.values(grouped);
  }

  async getAvailableCalendars(userId: string) {
    const records = await this.prisma.userAccess.findMany({
      where: { grantedToId: userId },
      include: {
        owner: {
          select: { id: true, name: true, surname: true, patronymic: true },
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
          id: ownerId,
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

  async unsubscribe(grantedToId: string, ownerId: string): Promise<number> {
    const result = await this.prisma.userAccess.deleteMany({
      where: {
        ownerId,
        grantedToId,
      },
    });

    return result.count;
  }

  async getUserClaims(ownerId: string, userId: string) {
    const claims = await this.prisma.userAccess.findMany({
      where: { ownerId, grantedToId: userId },
      select: { claim: true },
    });

    return claims.map((c) => c.claim);
  }
}
