import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
      id: createdUser.id,
      name: createdUser.name,
      surname: createdUser.surname,
      patronymic: createdUser.patronymic,
      createdAt: createdUser.createdAt,
      timezone: createdUser.timezone,
    };
  }
}