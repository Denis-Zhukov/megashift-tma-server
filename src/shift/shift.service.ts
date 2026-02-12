import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { fromZonedTime } from 'date-fns-tz';
import { addDays, endOfMonth, startOfMonth, subDays } from 'date-fns';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

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

    const localStart = subDays(monthStart, 14);
    const localEnd = addDays(monthEnd, 14);

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

  async findByDay(userId: string, dateStr: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.shift.findMany({
      where: {
        userId,
        date: `${dateStr}T00:00:00.000Z`,
      },
      orderBy: { createdAt: 'asc' },
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

  async update(userId: string, shiftId: string, data: UpdateShiftDto) {
    const existingShift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });
    if (!existingShift || existingShift.userId !== userId) {
      throw new NotFoundException('Shift not found for this user');
    }

    return this.prisma.shift.update({
      where: { id: shiftId },
      data,
    });
  }

  async delete(userId: string, id: string) {
    return this.prisma.shift.delete({
      where: { id, userId },
    });
  }
}
