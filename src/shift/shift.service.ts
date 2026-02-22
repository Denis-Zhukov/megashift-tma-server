import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { fromZonedTime } from 'date-fns-tz';
import { addMonths, endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { timeStringToUtcDate } from '../utils/time-string-to-date';
import { AccessClaim } from '../types';
import { Shift } from '@prisma/client';

@Injectable()
export class ShiftService {
  constructor(private readonly prisma: PrismaService) {}

  async findByMonth({
    ownerId,
    year,
    month,
    userId,
  }: {
    userId: string;
    ownerId: string;
    year: number;
    month: number; // 1–12
  }): Promise<Shift[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const currentMonthStart = startOfMonth(new Date(year, month - 1));
    const prevMonthStart = startOfMonth(subMonths(currentMonthStart, 1));
    const nextMonthEnd = endOfMonth(addMonths(currentMonthStart, 1));

    const utcStart = fromZonedTime(prevMonthStart, user.timezone);
    const utcEnd = fromZonedTime(nextMonthEnd, user.timezone);

    return this.prisma.shift.findMany({
      where: {
        ownerId,
        date: { gte: utcStart, lte: utcEnd },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByDate({
    ownerId,
    dateStr,
  }: {
    ownerId: string;
    dateStr: string;
  }): Promise<Shift[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    return this.prisma.shift.findMany({
      where: { ownerId, date: `${dateStr}T00:00:00.000Z` },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create({
    ownerId,
    userId,
    dto,
  }: {
    ownerId: string;
    userId: string;
    dto: CreateShiftDto;
  }): Promise<Shift> {
    return this.prisma.shift.create({
      data: {
        ownerId,
        creatorId: userId,
        shiftTemplateId: dto.shiftTemplateId,
        date: this.toUtcDate(dto.date),
      },
    });
  }

  async update({
    ownerId,
    userId,
    shiftId,
    dto,
    claims = [],
  }: {
    ownerId: string;
    userId: string;
    shiftId: string;
    dto: UpdateShiftDto;
    claims?: AccessClaim[];
  }): Promise<Shift> {
    const [user, shift] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { timezone: true },
      }),
      this.prisma.shift.findUnique({ where: { id: shiftId, ownerId } }),
    ]);

    if (!user) throw new NotFoundException('User not found');
    if (!shift) throw new NotFoundException('Shift not found');

    this.checkPermissions({
      shift,
      userId,
      ownerId,
      claims,
      actionType: 'edit',
    });

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        actualStartTime: this.toUtcDateFromTimeString(
          dto.actualStartTime,
          user.timezone,
        ),
        actualEndTime: this.toUtcDateFromTimeString(
          dto.actualEndTime,
          user.timezone,
        ),
      },
    });
  }

  async delete({
    shiftId,
    ownerId,
    userId,
    claims = [],
  }: {
    shiftId: string;
    ownerId: string;
    userId: string;
    claims?: AccessClaim[];
  }): Promise<Shift> {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId, ownerId },
    });
    if (!shift) throw new NotFoundException('Shift not found');

    this.checkPermissions({
      shift,
      userId,
      ownerId,
      claims,
      actionType: 'delete',
    });

    return this.prisma.shift.delete({ where: { id: shiftId, ownerId } });
  }

  private checkPermissions({
    shift,
    userId,
    ownerId,
    claims,
    actionType,
  }: {
    shift: Shift;
    userId: string;
    ownerId: string;
    claims?: AccessClaim[];
    actionType: 'edit' | 'delete';
  }) {
    const isOwner = ownerId === userId;
    const isCreator = shift.creatorId === userId;

    const claimMap = {
      edit: { owner: AccessClaim.EDIT_ALL, self: AccessClaim.EDIT_SELF },
      delete: {
        owner: AccessClaim.DELETE_ALL,
        self: AccessClaim.DELETE_SELF,
      },
    }[actionType];

    const allowed =
      isOwner ||
      claims?.includes(claimMap.owner) ||
      (isCreator && claims?.includes(claimMap.self));

    if (!allowed) throw new ForbiddenException('Недостаточно прав');
  }

  private toUtcDate(dateStr: string): string {
    return `${dateStr}T00:00:00.000Z`;
  }

  private toUtcDateFromTimeString(
    timeStr: string,
    timezone: string,
  ): Date | null {
    if (!timeStr) return null;
    return timeStringToUtcDate(timeStr, timezone);
  }
}
