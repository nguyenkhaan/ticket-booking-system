/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { HealthService } from './health.service';

describe('HealthService', () => {
    let prisma: any;
    let service: HealthService;

    beforeEach(() => {
        prisma = { $queryRaw: jest.fn() };
        service = new HealthService(prisma);
    });

    it('returns liveness status', async () => {
        const result = await service.liveness();

        expect(result.status).toBe('UP');
        expect(Date.parse(result.timestamp)).not.toBeNaN();
    });

    it('returns readiness up when database query succeeds', async () => {
        prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

        const result = await service.readiness();

        expect(result.status).toBe('UP');
        expect(result.checks.database).toBe('UP');
    });

    it('returns readiness down when database query fails', async () => {
        prisma.$queryRaw.mockRejectedValue(new Error('db offline'));

        const result = await service.readiness();

        expect(result).toMatchObject({
            status: 'DOWN',
            checks: { database: 'DOWN' },
            error: 'db offline',
        });
    });
});
