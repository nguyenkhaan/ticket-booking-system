/// <reference types="jest" />

import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { UserRole } from '@/bases/decorators/role.decorator';

describe('JwtStrategy', () => {
    it('returns JWT payload from validate', () => {
        const configService = {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
        };
        const strategy = new JwtStrategy(configService as any);
        const payload: JwtPayload = {
            sub: 'user-1',
            email: 'cloud@example.com',
            role: UserRole.ADMIN,
        };

        expect(strategy.validate(payload)).toBe(payload);
        expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
    });
});
