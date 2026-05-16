/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { AuthController } from './auth.controller';

describe('AuthController', () => {
    it('delegates register and login to auth service', async () => {
        const authService = {
            register: jest.fn().mockResolvedValue({ access_token: 'token' }),
            login: jest.fn().mockResolvedValue({ access_token: 'token' }),
        };
        const controller = new AuthController(authService as any);

        await expect(
            controller.register({
                email: 'cloud@example.com',
                password: 'secret123',
                fullName: 'Cloud User',
            }),
        ).resolves.toEqual({ access_token: 'token' });
        expect(authService.register).toHaveBeenCalledWith({
            email: 'cloud@example.com',
            password: 'secret123',
            fullName: 'Cloud User',
        });

        await controller.login({
            email: 'cloud@example.com',
            password: 'secret123',
        });
        expect(authService.login).toHaveBeenCalledWith({
            email: 'cloud@example.com',
            password: 'secret123',
        });
    });
});
