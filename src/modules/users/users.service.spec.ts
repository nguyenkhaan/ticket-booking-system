/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';

describe('UsersService', () => {
    let service: UsersService;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            user: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };
        service = new UsersService(prisma);
        jest.clearAllMocks();
    });

    it('hashes password and creates user without exposing password hash', async () => {
        prisma.user.create.mockResolvedValue({ id: 'user-1' });

        await service.create({
            email: 'cloud@example.com',
            password: 'secret123',
            fullName: 'Cloud User',
        });

        expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                email: 'cloud@example.com',
                fullName: 'Cloud User',
                passwordHash: 'hashed-password',
            },
            select: expect.not.objectContaining({ passwordHash: true }),
        });
    });

    it('delegates read/update/delete operations to prisma', async () => {
        await service.findAll();
        expect(prisma.user.findMany).toHaveBeenCalledWith({
            select: expect.objectContaining({ id: true, email: true }),
        });

        await service.findOne('user-1');
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            select: expect.objectContaining({ id: true, email: true }),
        });

        await service.findByEmail('cloud@example.com');
        expect(prisma.user.findFirst).toHaveBeenCalledWith({
            where: { email: 'cloud@example.com' },
        });

        await service.update('user-1', { fullName: 'New Name' });
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { fullName: 'New Name' },
            select: expect.objectContaining({ id: true, email: true }),
        });

        await service.remove('user-1');
        expect(prisma.user.delete).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            select: { id: true, email: true },
        });
    });

    it('validates passwords with bcrypt compare', async () => {
        jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

        await expect(service.validatePassword('secret123', 'hash')).resolves.toBe(
            true,
        );
        expect(bcrypt.compare).toHaveBeenCalledWith('secret123', 'hash');
    });
});
