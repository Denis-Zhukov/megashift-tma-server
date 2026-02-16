import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ShiftStatsItemCount = {
  id: string | null;
  color: string;
  shiftName: string;
  count: number;
};

type ShiftStatsItemHours = {
  id: string | null;
  color: string;
  shiftName: string;
  hours: number;
};

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getShiftsByTemplate(
    userId: string,
    year: number,
    month: number,
  ): Promise<ShiftStatsItemCount[]> {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const grouped = await this.prisma.shift.groupBy({
      by: ['shiftTemplateId'],
      where: {
        ownerId: userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _count: {
        _all: true,
      },
    });

    const countsMap = new Map<string | null, number>();
    for (const item of grouped) {
      countsMap.set(item.shiftTemplateId ?? null, item._count._all);
    }

    const templateIds = Array.from(countsMap.keys()).filter(
      (id): id is string => id !== null,
    );

    let templates: { id: string; label: string; color: string }[] = [];
    if (templateIds.length > 0) {
      templates = await this.prisma.shiftTemplate.findMany({
        where: {
          userId,
          id: { in: templateIds },
        },
        select: {
          id: true,
          label: true,
          color: true,
        },
        orderBy: { label: 'asc' },
      });
    }

    const result: ShiftStatsItemCount[] = templates.map((t) => ({
      id: t.id,
      color: t.color,
      shiftName: t.label,
      count: countsMap.get(t.id) ?? 0,
    }));

    const withoutTemplateCount = countsMap.get(null) ?? 0;
    if (withoutTemplateCount > 0) {
      result.push({
        id: '0',
        color: '#ffbbee',
        shiftName: '(Без шаблона смены)',
        count: withoutTemplateCount,
      });
    }

    return result;
  }

  async getShiftsHoursByTemplate(
    userId: string,
    year: number,
    month: number,
  ): Promise<ShiftStatsItemHours[]> {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const shifts = await this.prisma.shift.findMany({
      where: {
        ownerId: userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        shiftTemplate: true,
      },
    });

    const hoursMap = new Map<string | null, number>();

    for (const shift of shifts) {
      const start = shift.actualStartTime ?? shift.shiftTemplate?.startTime;
      const end = shift.actualEndTime ?? shift.shiftTemplate?.endTime;

      const hours =
        start && end ? (end.getTime() - start.getTime()) / (1000 * 60 * 60) : 0;

      const key = shift.shiftTemplateId ?? null;
      hoursMap.set(key, (hoursMap.get(key) ?? 0) + hours);
    }

    const templateIds = Array.from(hoursMap.keys()).filter(
      (id): id is string => id !== null,
    );

    let templates: { id: string; label: string; color: string }[] = [];
    if (templateIds.length > 0) {
      templates = await this.prisma.shiftTemplate.findMany({
        where: {
          userId,
          id: { in: templateIds },
        },
        select: {
          id: true,
          label: true,
          color: true,
        },
        orderBy: { label: 'asc' },
      });
    }

    const result: ShiftStatsItemHours[] = templates.map((t) => ({
      id: t.id,
      color: t.color,
      shiftName: t.label,
      hours: hoursMap.get(t.id) ?? 0,
    }));

    const withoutTemplateHours = hoursMap.get(null) ?? 0;
    if (withoutTemplateHours > 0) {
      result.push({
        id: '0',
        color: '#ffbbee',
        shiftName: '(Без названия)',
        hours: withoutTemplateHours,
      });
    }

    return result;
  }

  async getSalaryForMonth(userId: string, year: number, month: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        salary: true,
        typeSalary: true,
        maxSalary: true,
      },
    });

    if (!user || user.salary === null || !user.typeSalary) {
      return { salary: 0, typeSalary: 'UNKNOWN' };
    }

    let totalSalary = 0;

    if (user.typeSalary === 'MONTHLY') {
      totalSalary = user.salary;
    } else if (user.typeSalary === 'SHIFT') {
      const shiftCount = await this.prisma.shift.count({
        where: {
          ownerId: userId,
          date: {
            gte: new Date(Date.UTC(year, month - 1, 1)),
            lt: new Date(Date.UTC(year, month, 1)),
          },
        },
      });
      totalSalary = shiftCount * user.salary;
    } else if (user.typeSalary === 'HOURLY') {
      const shifts = await this.prisma.shift.findMany({
        where: {
          ownerId: userId,
          date: {
            gte: new Date(Date.UTC(year, month - 1, 1)),
            lt: new Date(Date.UTC(year, month, 1)),
          },
        },
        include: {
          shiftTemplate: true,
        },
      });

      let totalHours = 0;
      for (const shift of shifts) {
        const start = shift.actualStartTime ?? shift.shiftTemplate?.startTime;
        const end = shift.actualEndTime ?? shift.shiftTemplate?.endTime;
        if (start && end) {
          totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }
      }
      totalSalary = totalHours * user.salary;
    }

    return {
      salary: totalSalary,
      typeSalary: user.typeSalary,
      maxSalary: user.maxSalary,
    };
  }
}
