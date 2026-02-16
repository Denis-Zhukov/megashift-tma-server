import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { fromZonedTime } from 'date-fns-tz';
import { addDays, endOfMonth, startOfMonth, subDays } from 'date-fns';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { timeStringToUtcDate } from '../utils/time-string-to-date';
import { AccessClaim } from '../types';

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
    month: number;
  }) {
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
        ownerId,
        date: {
          gte: utcStart,
          lte: utcEnd,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findByDay({ ownerId, dateStr }: { ownerId: string; dateStr: string }) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    return this.prisma.shift.findMany({
      where: {
        ownerId,
        date: `${dateStr}T00:00:00.000Z`,
      },
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
  }) {
    return this.prisma.shift.create({
      data: {
        ownerId,
        creatorId: userId,
        shiftTemplateId: dto.shiftTemplateId,
        date: `${dto.date}T00:00:00.000Z`,
      },
    });
  }

  async update({
    ownerId,
    userId,
    shiftId,
    dto,
    claims,
  }: {
    ownerId: string;
    userId: string;
    shiftId: string;
    dto: UpdateShiftDto;
    claims: AccessClaim[];
  }) {
    const [user, shift] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { timezone: true },
      }),
      this.prisma.shift.findUnique({
        where: { id: shiftId, ownerId },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!shift) {
      throw new NotFoundException('Shift not found for this user');
    }

    const isOwner = ownerId === userId;
    const isCreator = shift.creatorId === userId;

    const canEditOwner = claims.includes(AccessClaim.EDIT_OWNER);
    const canEditSelf = claims.includes(AccessClaim.EDIT_SELF);

    const canEdit = isOwner || canEditOwner || (isCreator && canEditSelf);

    if (!canEdit) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        actualStartTime: timeStringToUtcDate(
          dto.actualStartTime,
          user.timezone,
        ),
        actualEndTime: timeStringToUtcDate(dto.actualEndTime, user.timezone),
      },
    });
  }

  async delete({
    shiftId,
    ownerId,
    userId,
    claims,
  }: {
    shiftId: string;
    ownerId: string;
    userId: string;
    claims: AccessClaim[];
  }) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId, ownerId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found for this user');
    }

    const isOwner = ownerId === userId;
    const isCreator = shift.creatorId === userId;

    const canDeleteOwner = claims.includes(AccessClaim.DELETE_OWNER);
    const canDeleteSelf = claims.includes(AccessClaim.DELETE_SELF);

    const canDelete = isOwner || canDeleteOwner || (isCreator && canDeleteSelf);

    if (!canDelete) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return this.prisma.shift.delete({
      where: { id: shiftId, ownerId },
    });
  }
}
