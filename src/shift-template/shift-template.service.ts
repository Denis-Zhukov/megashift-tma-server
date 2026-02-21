import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { timeStringToUtcDate } from '../utils/time-string-to-date';
import { AccessClaim } from '../types';

type TemplatePermissionData = {
  ownerId: string;
  creatorId: string;
};

@Injectable()
export class ShiftTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(ownerId: string) {
    return this.prisma.shiftTemplate.findMany({
      where: { ownerId },
      select: {
        id: true,
        label: true,
        startTime: true,
        endTime: true,
        color: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getTemplateByUserAndOwner({
    userId,
    templateId,
    claims = [],
  }: {
    userId: string;
    templateId: string;
    claims?: AccessClaim[];
  }) {
    const template = await this.prisma.shiftTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Shift template not found');
    }

    this.checkPermissions({
      template,
      userId,
      claims,
      actionType: 'read',
    });

    return {
      id: template.id,
      label: template.label,
      startTime: template.startTime,
      endTime: template.endTime,
      color: template.color,
    };
  }

  async createTemplate({
    ownerId,
    userId,
    dto,
  }: {
    ownerId: string;
    userId: string;
    dto: CreateTemplateDto;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.shiftTemplate.count({
        where: { ownerId },
      });

      if (count >= 10) {
        throw new BadRequestException(
          'Достигнуто максимальное количество шаблонов - 10',
        );
      }

      return tx.shiftTemplate.create({
        data: {
          owner: {
            connect: { id: ownerId },
          },
          creator: {
            connect: { id: userId },
          },
          label: dto.label,
          color: dto.color,
          startTime: timeStringToUtcDate(dto.startTime, user.timezone),
          endTime: timeStringToUtcDate(dto.endTime, user.timezone),
        },
      });
    });
  }

  async updateTemplate({
    userId,
    templateId,
    dto,
    claims = [],
  }: {
    userId: string;
    templateId: string;
    dto: CreateTemplateDto;
    claims?: AccessClaim[];
  }) {
    const template = await this.prisma.shiftTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Shift template not found');
    }

    this.checkPermissions({
      template,
      userId,
      claims,
      actionType: 'edit',
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.shiftTemplate.update({
      where: { id: templateId },
      data: {
        label: dto.label,
        color: dto.color,
        startTime: timeStringToUtcDate(dto.startTime, user.timezone),
        endTime: timeStringToUtcDate(dto.endTime, user.timezone),
      },
    });
  }

  async deleteTemplate({
    userId,
    templateId,
    claims = [],
  }: {
    userId: string;
    templateId: string;
    claims?: AccessClaim[];
  }) {
    const template = await this.prisma.shiftTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Shift template not found');
    }

    this.checkPermissions({
      template,
      userId,
      claims,
      actionType: 'delete',
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.shift.updateMany({
        where: {
          ownerId: template.ownerId,
          shiftTemplateId: templateId,
          AND: [{ actualStartTime: null }, { actualEndTime: null }],
        },
        data: {
          actualStartTime: template.startTime,
          actualEndTime: template.endTime,
        },
      });

      return tx.shiftTemplate.delete({
        where: { id: templateId },
      });
    });
  }

  private checkPermissions({
    template,
    userId,
    claims = [],
    actionType,
  }: {
    template: TemplatePermissionData;
    userId: string;
    claims?: AccessClaim[];
    actionType: 'read' | 'edit' | 'delete';
  }) {
    const isOwner = template.ownerId === userId;
    const isCreator = template.creatorId === userId;

    const claimMap = {
      read: {
        owner: AccessClaim.READ,
        self: AccessClaim.READ,
      },
      edit: {
        owner: AccessClaim.DELETE_ALL,
        self: AccessClaim.EDIT_SELF,
      },
      delete: {
        owner: AccessClaim.DELETE_ALL,
        self: AccessClaim.DELETE_SELF,
      },
    }[actionType];

    const allowed =
      isOwner ||
      claims.includes(claimMap.owner) ||
      (isCreator && claims.includes(claimMap.self));

    if (!allowed) {
      throw new ForbiddenException('Недостаточно прав');
    }
  }
}
