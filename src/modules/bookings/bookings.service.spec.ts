/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}), { virtual: true });

import { BadRequestException, ConflictException } from '@nestjs/common';
import { BookingService } from './bookings.service';

describe('BookingService data flow', () => {
    let service: BookingService;
    let prisma: any;

    const ticketCategory = {
        id: 'ticket-standard-001',
        name: 'Standard',
        price: '150.00',
        totalQuantity: 10,
        reservedQuantity: 2,
        soldQuantity: 3,
        maxPerOrder: 5,
    };

    beforeEach(() => {
        prisma = {
            booking: {
                findFirst: jest.fn(),
                create: jest.fn(),
            },
            ticketCategory: {
                findFirst: jest.fn(),
                update: jest.fn(),
            },
            voucher: {
                findFirst: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
            },
            voucherRedemption: {
                create: jest.fn(),
            },
            $transaction: jest.fn(async (callback) => callback(prisma)),
        };

        service = new BookingService(prisma);
    });

    it('returns existing booking when same user submits same payload again', async () => {
        const existingBooking = {
            id: 'booking-1',
            bookingItems: [],
        };
        prisma.booking.findFirst.mockResolvedValue(existingBooking);

        const result = await service.create(
            {
                items: [
                    {
                        ticketCategoryId: 'ticket-standard-001',
                        quantity: 2,
                    },
                ],
            },
            'user-1',
        );

        expect(result).toBe(existingBooking);
        expect(prisma.ticketCategory.findFirst).not.toHaveBeenCalled();
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('creates booking and reserves ticket inventory in one transaction', async () => {
        const newBooking = {
            id: 'booking-1',
            bookingCode: 'BK-TEST',
            bookingItems: [
                {
                    ticketCategoryId: 'ticket-standard-001',
                    quantity: 2,
                },
            ],
        };

        prisma.booking.findFirst.mockResolvedValue(null);
        prisma.ticketCategory.findFirst.mockResolvedValue(ticketCategory);
        prisma.booking.create.mockResolvedValue(newBooking);

        const result = await service.create(
            {
                items: [
                    {
                        ticketCategoryId: 'ticket-standard-001',
                        quantity: 2,
                    },
                ],
            },
            'user-1',
        );

        expect(result).toBe(newBooking);
        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
        expect(prisma.ticketCategory.update).toHaveBeenCalledWith({
            where: { id: 'ticket-standard-001' },
            data: {
                reservedQuantity: {
                    increment: 2,
                },
            },
        });
        expect(prisma.booking.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: 'user-1',
                subtotalAmount: 300,
                discountAmount: 0,
                totalAmount: 300,
                voucherId: null,
                idempotencyKey: expect.stringContaining('user-1-'),
                bookingItems: {
                    create: [
                        {
                            ticketCategoryId: 'ticket-standard-001',
                            lineTotal: 300,
                            quantity: 2,
                            unitPrice: '150.00',
                        },
                    ],
                },
            }),
            include: { bookingItems: true },
        });
    });

    it('rejects quantity above ticket category max per order before transaction', async () => {
        prisma.booking.findFirst.mockResolvedValue(null);
        prisma.ticketCategory.findFirst.mockResolvedValue(ticketCategory);

        await expect(
            service.create(
                {
                    items: [
                        {
                            ticketCategoryId: 'ticket-standard-001',
                            quantity: 6,
                        },
                    ],
                },
                'user-1',
            ),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects booking when remaining inventory is not enough', async () => {
        prisma.booking.findFirst.mockResolvedValue(null);
        prisma.ticketCategory.findFirst.mockResolvedValue({
            ...ticketCategory,
            totalQuantity: 4,
            reservedQuantity: 2,
            soldQuantity: 1,
        });

        await expect(
            service.create(
                {
                    items: [
                        {
                            ticketCategoryId: 'ticket-standard-001',
                            quantity: 2,
                        },
                    ],
                },
                'user-1',
            ),
        ).rejects.toBeInstanceOf(ConflictException);

        expect(prisma.booking.create).not.toHaveBeenCalled();
    });
});
