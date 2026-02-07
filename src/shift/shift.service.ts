import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { fromZonedTime } from 'date-fns-tz';
import { startOfMonth, endOfMonth } from 'date-fns';
import { CreateShiftDto } from './dto/create-shift.dto';

type FindByMonthArgs = {
  year: number;
  month: number;
};

@Injectable()
export class ShiftService {
  constructor(private readonly prisma: PrismaService) {}

  async findByMonth(userId: string, { year, month }: FindByMonthArgs) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const localStart = startOfMonth(new Date(year, month - 1));
    const localEnd = endOfMonth(new Date(year, month - 1));

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

    const dateUtc = fromZonedTime(
      new Date(`${dto.date}T00:00:00`),
      user.timezone,
    );

    return this.prisma.shift.create({
      data: {
        userId,
        shiftTemplateId: dto.shiftTemplateId,
        date: dateUtc,
      },
    });
  }
}
