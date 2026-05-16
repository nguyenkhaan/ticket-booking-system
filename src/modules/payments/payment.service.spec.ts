/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payment.service';

describe('PaymentsService', () => {
    let service: PaymentsService;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            booking: { findUnique: jest.fn() },
            payment: {
                create: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };
        service = new PaymentsService(prisma);
    });

    it('creates payment from booking amount', async () => {
        prisma.booking.findUnique.mockResolvedValue({
            id: 'booking-1',
            totalAmount: 500,
        });
        prisma.payment.findUnique.mockResolvedValue(null);

        await service.create('booking-1', 'stripe');

        expect(prisma.payment.create).toHaveBeenCalledWith({
            data: {
                bookingId: 'booking-1',
                provider: 'stripe',
                amount: 500,
            },
        });
    });

    it('returns existing payment and rejects missing booking', async () => {
        const existing = { id: 'payment-1' };
        prisma.booking.findUnique.mockResolvedValueOnce({ id: 'booking-1' });
        prisma.payment.findUnique.mockResolvedValueOnce(existing);
        await expect(service.create('booking-1')).resolves.toBe(existing);

        prisma.booking.findUnique.mockResolvedValueOnce(null);
        await expect(service.create('missing')).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });

    it('finds payment by booking id and updates success status', async () => {
        await service.findByBookingId('booking-1');
        expect(prisma.payment.findUnique).toHaveBeenCalledWith({
            where: { bookingId: 'booking-1' },
        });

        prisma.payment.findUnique.mockResolvedValue({
            id: 'payment-1',
            providerRef: 'old-ref',
        });
        await service.updatePaymentStatus('booking-1', 'SUCCESS' as any, 'ref-1');

        expect(prisma.payment.update).toHaveBeenCalledWith({
            where: { id: 'payment-1' },
            data: {
                status: 'SUCCESS',
                providerRef: 'ref-1',
                paidAt: expect.any(Date),
            },
        });
    });

    it('rejects status update when payment is missing', async () => {
        prisma.payment.findUnique.mockResolvedValue(null);

        await expect(
            service.updatePaymentStatus('booking-1', 'FAILED' as any),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
