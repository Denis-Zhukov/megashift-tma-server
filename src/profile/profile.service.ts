import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(tgUserId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: tgUserId,
      },
      select: {
        name: true,
        surname: true,
        patronymic: true,
        createdAt: true,
      },
    });
  }
}
