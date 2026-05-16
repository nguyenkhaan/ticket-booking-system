import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    action: string,
    resourceType: string,
    resourceId: string,
    actorUserId?: string,
    beforeData?: any,
    afterData?: any,
    ipAddress?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        action,
        resourceType,
        resourceId,
        actorUserId,
        beforeData,
        afterData,
        ipAddress,
      },
    });
  }

  async findByResource(resourceType: string, resourceId: string) {
    return this.prisma.auditLog.findMany({
      where: { resourceType, resourceId },
      orderBy: { createdAt: 'desc' },
      include: {
        actorUser: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findByActor(actorUserId: string) {
    return this.prisma.auditLog.findMany({
      where: { actorUserId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(limit: number = 100, offset: number = 0) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        actorUser: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }
}