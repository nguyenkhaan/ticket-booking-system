/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { AuditLogController } from './audit.controller';

describe('AuditLogController', () => {
    it('delegates audit log queries to audit log service', () => {
        const service = {
            findAll: jest.fn(),
            findByResource: jest.fn(),
            findByActor: jest.fn(),
        };
        const controller = new AuditLogController(service as any);

        controller.findAll(25, 50);
        expect(service.findAll).toHaveBeenCalledWith(25, 50);

        controller.findByResource('booking', 'booking-1');
        expect(service.findByResource).toHaveBeenCalledWith(
            'booking',
            'booking-1',
        );

        controller.findByActor('user-1');
        expect(service.findByActor).toHaveBeenCalledWith('user-1');
    });
});
