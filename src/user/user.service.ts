import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
}
