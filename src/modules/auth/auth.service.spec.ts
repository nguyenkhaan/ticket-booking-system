/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: any;
    let jwtService: any;

    const user = {
        id: 'user-1',
        email: 'cloud@example.com',
        fullName: 'Cloud User',
        role: 'CUSTOMER',
        passwordHash: 'hash',
    };

    beforeEach(() => {
        usersService = {
            findByEmail: jest.fn(),
            create: jest.fn(),
            validatePassword: jest.fn(),
        };
        jwtService = { sign: jest.fn().mockReturnValue('signed-token') };
        service = new AuthService(usersService, jwtService);
    });

    it('registers new user and returns token with safe user fields', async () => {
        usersService.findByEmail.mockResolvedValue(null);
        usersService.create.mockResolvedValue(user);

        const result = await service.register({
            email: user.email,
            password: 'secret123',
            fullName: user.fullName,
        });

        expect(usersService.create).toHaveBeenCalledWith({
            email: user.email,
            password: 'secret123',
            fullName: user.fullName,
        });
        expect(jwtService.sign).toHaveBeenCalledWith({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        expect(result).toEqual({
            access_token: 'signed-token',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    });

    it('rejects duplicate registration email', async () => {
        usersService.findByEmail.mockResolvedValue(user);

        await expect(
            service.register({
                email: user.email,
                password: 'secret123',
                fullName: user.fullName,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(usersService.create).not.toHaveBeenCalled();
    });

    it('logs in user with valid password', async () => {
        usersService.findByEmail.mockResolvedValue(user);
        usersService.validatePassword.mockResolvedValue(true);

        const result = await service.login({
            email: user.email,
            password: 'secret123',
        });

        expect(usersService.validatePassword).toHaveBeenCalledWith(
            'secret123',
            'hash',
        );
        expect(result.access_token).toBe('signed-token');
    });

    it('rejects missing user or invalid password on login', async () => {
        usersService.findByEmail.mockResolvedValueOnce(null);
        await expect(
            service.login({ email: user.email, password: 'bad' }),
        ).rejects.toBeInstanceOf(UnauthorizedException);

        usersService.findByEmail.mockResolvedValueOnce(user);
        usersService.validatePassword.mockResolvedValueOnce(false);
        await expect(
            service.login({ email: user.email, password: 'bad' }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });
});
