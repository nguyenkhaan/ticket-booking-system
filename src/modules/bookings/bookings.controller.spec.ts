/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { BookingController } from './bookings.controller';

describe('BookingController', () => {
    it('delegates booking endpoints and extracts current user id', async () => {
        const service = {
            create: jest.fn(),
            findByBookingCode: jest.fn(),
            findOne: jest.fn(),
            findUserBookings: jest.fn(),
            cancel: jest.fn(),
            confirmBooking: jest.fn(),
        };
        const controller = new BookingController(service as any);
        const req = { user: { sub: 'user-1' } } as any;

        await controller.create(req, { items: [] } as any);
        expect(service.create).toHaveBeenCalledWith({ items: [] }, 'user-1');

        await controller.findByCode('BK-1');
        expect(service.findByBookingCode).toHaveBeenCalledWith('BK-1');

        await controller.findOne('booking-1');
        expect(service.findOne).toHaveBeenCalledWith('booking-1');

        await controller.getUserBookings(req);
        expect(service.findUserBookings).toHaveBeenCalledWith('user-1');

        await controller.cancel('booking-1', { reason: 'changed plan' });
        expect(service.cancel).toHaveBeenCalledWith('booking-1', 'changed plan');

        await controller.confirm('booking-1');
        expect(service.confirmBooking).toHaveBeenCalledWith('booking-1');
    });
});
