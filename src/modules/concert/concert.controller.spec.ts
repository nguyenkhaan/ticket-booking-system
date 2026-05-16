/// <reference types="jest" />

jest.mock('@/prisma/prisma.service', () => ({
    PrismaService: class PrismaService {},
}));
jest.mock('@prisma/client', () => ({}));

import { ConcertController } from './concert.controller';

describe('ConcertController', () => {
    it('delegates concert endpoints and extracts user id from request', () => {
        const service = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };
        const controller = new ConcertController(service as any);

        controller.findAll('PUBLISHED' as any);
        expect(service.findAll).toHaveBeenCalledWith('PUBLISHED');

        controller.findOne('concert-1');
        expect(service.findOne).toHaveBeenCalledWith('concert-1');

        controller.create({ title: 'Live Show' } as any, {
            user: { sub: 'user-1' },
        } as any);
        expect(service.create).toHaveBeenCalledWith(
            { title: 'Live Show' },
            'user-1',
        );

        controller.update('concert-1', { title: 'New Title' } as any);
        expect(service.update).toHaveBeenCalledWith('concert-1', {
            title: 'New Title',
        });

        controller.remove('concert-1');
        expect(service.remove).toHaveBeenCalledWith('concert-1');
    });
});
