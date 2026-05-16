/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));

import { UsersController } from './users.controller';

describe('UsersController', () => {
    it('delegates CRUD methods to users service', async () => {
        const usersService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };
        const controller = new UsersController(usersService as any);

        await controller.create({
            email: 'cloud@example.com',
            password: 'secret123',
            fullName: 'Cloud User',
        });
        expect(usersService.create).toHaveBeenCalledWith({
            email: 'cloud@example.com',
            password: 'secret123',
            fullName: 'Cloud User',
        });

        await controller.findAll();
        expect(usersService.findAll).toHaveBeenCalled();

        await controller.findById('user-1');
        expect(usersService.findOne).toHaveBeenCalledWith('user-1');

        await controller.update('user-1', { fullName: 'New Name' });
        expect(usersService.update).toHaveBeenCalledWith('user-1', {
            fullName: 'New Name',
        });

        await controller.remove('user-1');
        expect(usersService.remove).toHaveBeenCalledWith('user-1');
    });
});
