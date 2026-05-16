/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { AuditLogService } from './audit.service';

describe('AuditLogService', () => {
    let service: AuditLogService;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            auditLog: {
                create: jest.fn(),
                findMany: jest.fn(),
            },
        };
        service = new AuditLogService(prisma);
    });

    it('creates audit log entry with actor and data snapshots', async () => {
        await service.log(
            'UPDATE',
            'booking',
            'booking-1',
            'user-1',
            { status: 'PENDING' },
            { status: 'CONFIRMED' },
            '127.0.0.1',
        );

        expect(prisma.auditLog.create).toHaveBeenCalledWith({
            data: {
                action: 'UPDATE',
                resourceType: 'booking',
                resourceId: 'booking-1',
                actorUserId: 'user-1',
                beforeData: { status: 'PENDING' },
                afterData: { status: 'CONFIRMED' },
                ipAddress: '127.0.0.1',
            },
        });
    });

    it('finds logs by resource, actor, and paginated list', async () => {
        await service.findByResource('booking', 'booking-1');
        expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
            where: { resourceType: 'booking', resourceId: 'booking-1' },
            orderBy: { createdAt: 'desc' },
            include: {
                actorUser: {
                    select: { id: true, email: true, fullName: true },
                },
            },
        });

        await service.findByActor('user-1');
        expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
            where: { actorUserId: 'user-1' },
            orderBy: { createdAt: 'desc' },
        });

        await service.findAll(25, 50);
        expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
            orderBy: { createdAt: 'desc' },
            take: 25,
            skip: 50,
            include: {
                actorUser: {
                    select: { id: true, email: true, fullName: true },
                },
            },
        });
    });
});
