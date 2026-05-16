/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { ConcertService } from './concert.service';

describe('ConcertService', () => {
    let service: ConcertService;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            concert: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };
        service = new ConcertService(prisma);
    });

    it('creates concert with normalized dates and creator id', async () => {
        await service.create(
            {
                title: 'Live Show',
                description: 'Desc',
                venue: 'Hall',
                city: 'HCM',
                startTime: '2026-06-01T10:00:00.000Z',
                endTime: '2026-06-01T12:00:00.000Z',
            } as any,
            'user-1',
        );

        expect(prisma.concert.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                title: 'Live Show',
                createdById: 'user-1',
                startTime: new Date('2026-06-01T10:00:00.000Z'),
                endTime: new Date('2026-06-01T12:00:00.000Z'),
            }),
            include: { ticketCategories: true },
        });
    });

    it('finds concerts with optional status filter and ticket categories', async () => {
        await service.findAll('PUBLISHED' as any);
        expect(prisma.concert.findMany).toHaveBeenCalledWith({
            where: { status: 'PUBLISHED' },
            include: { ticketCategories: true },
            orderBy: { startTime: 'asc' },
        });

        await service.findOne('concert-1');
        expect(prisma.concert.findUnique).toHaveBeenCalledWith({
            where: { id: 'concert-1' },
            include: { ticketCategories: true },
        });
    });

    it('updates dates, status, and removes concert', async () => {
        await service.update('concert-1', {
            startTime: '2026-07-01T10:00:00.000Z',
        } as any);
        expect(prisma.concert.update).toHaveBeenCalledWith({
            where: { id: 'concert-1' },
            data: { startTime: new Date('2026-07-01T10:00:00.000Z') },
            include: { ticketCategories: true },
        });

        await service.updateStatus('concert-1', 'CANCELLED' as any);
        expect(prisma.concert.update).toHaveBeenCalledWith({
            where: { id: 'concert-1' },
            data: { status: 'CANCELLED' },
        });

        await service.remove('concert-1');
        expect(prisma.concert.delete).toHaveBeenCalledWith({
            where: { id: 'concert-1' },
        });
    });
});
