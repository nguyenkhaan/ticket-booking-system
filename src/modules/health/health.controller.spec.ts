/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { HealthController } from './health.controller';

describe('HealthController', () => {
    it('delegates liveness and readiness to health service', () => {
        const service = {
            liveness: jest.fn().mockReturnValue({ status: 'UP' }),
            readiness: jest.fn().mockReturnValue({ status: 'UP' }),
        };
        const controller = new HealthController(service as any);

        expect(controller.liveness()).toEqual({ status: 'UP' });
        expect(service.liveness).toHaveBeenCalled();

        expect(controller.readiness()).toEqual({ status: 'UP' });
        expect(service.readiness).toHaveBeenCalled();
    });
});
