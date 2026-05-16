import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
@Injectable()
export class HealthService {
    constructor(private readonly prisma: PrismaService) {}

    async liveness() {
        return {
            status: 'UP',
            timestamp: new Date().toISOString(),
        };
    }

    async readiness() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;

            return {
                status: 'UP',
                timestamp: new Date().toISOString(),
                checks: {
                    database: 'UP',
                },
            };
        } catch (error: any) {
            return {
                status: 'DOWN',
                timestamp: new Date().toISOString(),
                checks: {
                    database: 'DOWN',
                },
                error: error.message,
            };
        }
    }
}
