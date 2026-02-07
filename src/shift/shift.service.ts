import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { fromZonedTime } from 'date-fns-tz';
import { addDays, endOfMonth, startOfMonth, subDays } from 'date-fns';
import { CreateShiftDto } from './dto/create-shift.dto';

@Injectable()
export class ShiftService {
  constructor(private readonly prisma: PrismaService) {}

  async findByMonth(userId: string, year: number, month: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    const localStart = subDays(monthStart, 7);
    const localEnd = addDays(monthEnd, 7);

    const utcStart = fromZonedTime(localStart, user.timezone);
    const utcEnd = fromZonedTime(localEnd, user.timezone);

    return this.prisma.shift.findMany({
      where: {
        userId,
        date: {
          gte: utcStart,
          lte: utcEnd,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async create(userId: string, dto: CreateShiftDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return this.prisma.shift.create({
      data: {
        userId,
        shiftTemplateId: dto.shiftTemplateId,
        date: `${dto.date}T00:00:00.000Z`,
      },
    });
  }

  async delete(userId: string, id: string) {
    return this.prisma.shift.delete({
      where: { id, userId },
    });
  }
}
