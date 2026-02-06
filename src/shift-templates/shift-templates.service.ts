import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { timeStringToUtcDate } from '../utils/time-string-to-date';

@Injectable()
export class ShiftTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getTemplatesByUserId(userId: string) {
    return this.prisma.shiftTemplate.findMany({
      where: { userId },
    });
  }

  async getTemplateByUserIdAndById(userId: string, id: string) {
    return this.prisma.shiftTemplate.findUnique({
      where: { id, userId },
    });
  }

  async createTemplateByUserId(userId: string, dto: CreateTemplateDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.shiftTemplate.count({
        where: { userId },
      });

      if (count >= 10) {
        throw new BadRequestException(
          'Maximum number of shift templates (10) reached',
        );
      }

      return tx.shiftTemplate.create({
        data: {
          userId,
          label: dto.label,
          color: dto.color,
          startTime: timeStringToUtcDate(dto.startTime, user.timezone),
          endTime: timeStringToUtcDate(dto.endTime, user.timezone),
        },
      });
    });
  }

  async updateTemplate(
    userId: string,
    templateId: string,
    dto: CreateTemplateDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const exists = await this.prisma.shiftTemplate.findUnique({
      where: {
        id: templateId,
        userId,
      },
    });

    if (!exists) {
      throw new NotFoundException('Shift template not found');
    }

    return this.prisma.shiftTemplate.update({
      where: { id: templateId, userId },
      data: {
        label: dto.label,
        color: dto.color,
        startTime: timeStringToUtcDate(dto.startTime, user.timezone),
        endTime: timeStringToUtcDate(dto.endTime, user.timezone),
      },
    });
  }

  async deleteTemplate(userId: string, templateId: string) {
    return this.prisma.shiftTemplate.delete({
      where: { id: templateId, userId },
    });
  }
}
