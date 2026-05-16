/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));
jest.mock('@prisma/client', () => ({}));

import { PaymentsController } from './payment.controller';

describe('PaymentsController', () => {
    it('delegates payment endpoints to payments service', () => {
        const service = {
            create: jest.fn(),
            findByBookingId: jest.fn(),
            updatePaymentStatus: jest.fn(),
        };
        const controller = new PaymentsController(service as any);

        controller.create('booking-1');
        expect(service.create).toHaveBeenCalledWith('booking-1');

        controller.getByBookingId('booking-1');
        expect(service.findByBookingId).toHaveBeenCalledWith('booking-1');

        controller.webhook('booking-1', {
            status: 'SUCCESS' as any,
            providerRef: 'ref-1',
        });
        expect(service.updatePaymentStatus).toHaveBeenCalledWith(
            'booking-1',
            'SUCCESS',
            'ref-1',
        );
    });
});
