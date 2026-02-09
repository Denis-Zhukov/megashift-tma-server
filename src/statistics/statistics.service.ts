import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ShiftStatsItem = {
  id: string | null;
  color: string;
  shiftName: string;
  count: number;
};

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getShiftsByTemplate(
    userId: string,
    year: number,
    month: number,
  ): Promise<ShiftStatsItem[]> {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const grouped = await this.prisma.shift.groupBy({
      by: ['shiftTemplateId'],
      where: {
        userId,
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

    // Получаем только нужные шаблоны
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

    const result: ShiftStatsItem[] = templates.map((t) => ({
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
}
