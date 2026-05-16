/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));
jest.mock('@prisma/client', () => ({
    VoucherType: {
        PERCENT: 'PERCENT',
        FIXED: 'FIXED',
    },
}));

import { VoucherController } from './voucher.controller';

describe('VoucherController', () => {
    it('delegates voucher endpoints to vouchers service', () => {
        const service = {
            validate: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            getUsageReport: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };
        const controller = new VoucherController(service as any);

        controller.validate({ code: 'SAVE10', orderAmount: 100 });
        expect(service.validate).toHaveBeenCalledWith({
            code: 'SAVE10',
            orderAmount: 100,
        });

        controller.create({ code: 'SAVE10' } as any);
        expect(service.create).toHaveBeenCalledWith({ code: 'SAVE10' });

        controller.findAll();
        expect(service.findAll).toHaveBeenCalled();

        controller.findOne('voucher-1');
        expect(service.findOne).toHaveBeenCalledWith('voucher-1');

        controller.getUsageReport('voucher-1');
        expect(service.getUsageReport).toHaveBeenCalledWith('voucher-1');

        controller.update('voucher-1', { value: 20 } as any);
        expect(service.update).toHaveBeenCalledWith('voucher-1', { value: 20 });

        controller.remove('voucher-1');
        expect(service.remove).toHaveBeenCalledWith('voucher-1');
    });
});
