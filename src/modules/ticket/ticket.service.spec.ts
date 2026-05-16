/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { BadRequestException } from '@nestjs/common';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
    let service: TicketService;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            concert: { findUnique: jest.fn() },
            ticketCategory: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };
        service = new TicketService(prisma);
    });

    it('creates ticket category only when concert exists', async () => {
        prisma.concert.findUnique.mockResolvedValue({ id: 'concert-1' });

        await service.create({
            concertId: 'concert-1',
            name: 'VIP',
            price: 200,
            totalQuantity: 20,
            maxPerOrder: 2,
        } as any);

        expect(prisma.ticketCategory.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ price: '200' }),
        });
    });

    it('rejects create when concert does not exist', async () => {
        prisma.concert.findUnique.mockResolvedValue(null);

        await expect(
            service.create({ concertId: 'missing', price: 100 } as any),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns available quantity and rejects missing category', async () => {
        prisma.ticketCategory.findUnique.mockResolvedValueOnce({
            totalQuantity: 10,
            reservedQuantity: 3,
            soldQuantity: 2,
        });
        await expect(service.getAvailableQuantity('ticket-1')).resolves.toBe(5);

        prisma.ticketCategory.findUnique.mockResolvedValueOnce(null);
        await expect(service.getAvailableQuantity('missing')).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });

    it('delegates reads, update, and remove', async () => {
        await service.findByConcert('concert-1');
        expect(prisma.ticketCategory.findMany).toHaveBeenCalledWith({
            where: { concertId: 'concert-1' },
        });

        await service.findOne('ticket-1');
        expect(prisma.ticketCategory.findUnique).toHaveBeenCalledWith({
            where: { id: 'ticket-1' },
        });

        await service.update('ticket-1', { price: 99 } as any);
        expect(prisma.ticketCategory.update).toHaveBeenCalledWith({
            where: { id: 'ticket-1' },
            data: { price: '99' },
        });

        await service.remove('ticket-1');
        expect(prisma.ticketCategory.delete).toHaveBeenCalledWith({
            where: { id: 'ticket-1' },
        });
    });
});
