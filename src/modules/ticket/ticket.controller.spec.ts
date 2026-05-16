/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { TicketController } from './ticket.controller';

describe('TicketController', () => {
    it('delegates ticket category endpoints to ticket service', async () => {
        const service = {
            findByConcert: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };
        const controller = new TicketController(service as any);

        await controller.getTicketConcert('concert-1');
        expect(service.findByConcert).toHaveBeenCalledWith('concert-1');

        controller.findOne('ticket-1');
        expect(service.findOne).toHaveBeenCalledWith('ticket-1');

        controller.create({ name: 'VIP' } as any);
        expect(service.create).toHaveBeenCalledWith({ name: 'VIP' });

        controller.update('ticket-1', { price: 99 } as any);
        expect(service.update).toHaveBeenCalledWith('ticket-1', { price: 99 });

        controller.remove('ticket-1');
        expect(service.remove).toHaveBeenCalledWith('ticket-1');
    });
});
