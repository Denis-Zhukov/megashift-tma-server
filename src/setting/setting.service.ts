import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSalaryDto } from './dto/update-salary.dto';

@Injectable()
export class SettingService {
  constructor(private prisma: PrismaService) {}

  async updateSalary(userId: string, dto: UpdateSalaryDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        salary: dto.salary,
        typeSalary: dto.typeSalary,
        maxSalary: dto.maxSalary ?? null,
      },
    });
  }

  async getSettings(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        salary: true,
        typeSalary: true,
        maxSalary: true,
      },
    });
  }
}
