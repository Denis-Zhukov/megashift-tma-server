import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tgUserId: string, createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        id: tgUserId,
      },
    });
  }

  async checkRegistration(tgUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: tgUserId },
    });

    return {
      isRegistered: !!user,
      user: user || null,
    };
  }
}
