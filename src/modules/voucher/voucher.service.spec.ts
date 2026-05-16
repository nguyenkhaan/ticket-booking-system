/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { BadRequestException } from '@nestjs/common';
import { VouchersService } from './voucher.service';

describe('VouchersService', () => {
    let service: VouchersService;
    let prisma: any;

    const activeVoucher = {
        id: 'voucher-1',
        code: 'SAVE10',
        type: 'PERCENT',
        value: '10',
        status: 'ACTIVE',
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 100000),
        usedCount: 0,
        usageLimitTotal: 10,
        minOrderAmount: '100',
        maxDiscountAmount: '50',
    };

    beforeEach(() => {
        prisma = {
            voucher: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };
        service = new VouchersService(prisma);
    });

    it('creates voucher with numeric values stored as strings and parsed dates', async () => {
        prisma.voucher.findUnique.mockResolvedValue(null);

        await service.create({
            code: 'SAVE10',
            type: 'PERCENT',
            value: 10,
            maxDiscountAmount: 50,
            minOrderAmount: 100,
            validFrom: '2026-01-01T00:00:00.000Z',
            validTo: '2026-12-31T00:00:00.000Z',
        } as any);

        expect(prisma.voucher.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                value: '10',
                maxDiscountAmount: '50',
                minOrderAmount: '100',
                validFrom: new Date('2026-01-01T00:00:00.000Z'),
                validTo: new Date('2026-12-31T00:00:00.000Z'),
            }),
        });
    });

    it('rejects duplicate voucher code', async () => {
        prisma.voucher.findUnique.mockResolvedValue({ id: 'voucher-1' });

        await expect(service.create({ code: 'SAVE10' } as any)).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });

    it('validates active voucher and rounds discount', async () => {
        prisma.voucher.findUnique.mockResolvedValue(activeVoucher);

        await expect(
            service.validate({ code: 'SAVE10', orderAmount: 333.33 }),
        ).resolves.toEqual({ valid: true, discount: 33.33 });
    });

    it('returns validation failures for inactive, expired, limit, and minimum order', async () => {
        prisma.voucher.findUnique.mockResolvedValueOnce(null);
        await expect(
            service.validate({ code: 'BAD', orderAmount: 200 }),
        ).resolves.toMatchObject({ valid: false, message: 'Voucher not found' });

        prisma.voucher.findUnique.mockResolvedValueOnce({
            ...activeVoucher,
            status: 'INACTIVE',
        });
        await expect(
            service.validate({ code: 'SAVE10', orderAmount: 200 }),
        ).resolves.toMatchObject({ valid: false, message: 'Voucher is not active' });

        prisma.voucher.findUnique.mockResolvedValueOnce({
            ...activeVoucher,
            validTo: new Date(Date.now() - 1000),
        });
        await expect(
            service.validate({ code: 'SAVE10', orderAmount: 200 }),
        ).resolves.toMatchObject({ valid: false, message: 'Voucher has expired' });

        prisma.voucher.findUnique.mockResolvedValueOnce({
            ...activeVoucher,
            usedCount: 10,
            usageLimitTotal: 10,
        });
        await expect(
            service.validate({ code: 'SAVE10', orderAmount: 200 }),
        ).resolves.toMatchObject({
            valid: false,
            message: 'Voucher usage limit reached',
        });

        prisma.voucher.findUnique.mockResolvedValueOnce(activeVoucher);
        await expect(
            service.validate({ code: 'SAVE10', orderAmount: 50 }),
        ).resolves.toMatchObject({
            valid: false,
            message: 'Minimum order amount 100 required',
        });
    });

    it('updates, removes, and builds usage report', async () => {
        await service.findAll();
        expect(prisma.voucher.findMany).toHaveBeenCalledWith({
            orderBy: { createdAt: 'desc' },
        });

        await service.update('voucher-1', {
            value: 25,
            validFrom: '2026-01-01T00:00:00.000Z',
        } as any);
        expect(prisma.voucher.update).toHaveBeenCalledWith({
            where: { id: 'voucher-1' },
            data: expect.objectContaining({
                value: '25',
                validFrom: new Date('2026-01-01T00:00:00.000Z'),
            }),
        });

        await service.remove('voucher-1');
        expect(prisma.voucher.delete).toHaveBeenCalledWith({
            where: { id: 'voucher-1' },
        });

        prisma.voucher.findUnique.mockResolvedValue({
            ...activeVoucher,
            redemptions: [{ id: 'redemption-1' }],
        });
        await expect(service.getUsageReport('voucher-1')).resolves.toEqual({
            voucherId: 'voucher-1',
            code: 'SAVE10',
            totalUsageLimit: 10,
            currentUsage: 0,
            remainingUsage: 10,
            redemptions: [{ id: 'redemption-1' }],
        });
    });
});
