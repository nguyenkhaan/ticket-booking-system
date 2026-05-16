/// <reference types="jest" />

import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
    const makeContext = (role?: string): any => ({
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
            getRequest: () => ({ user: role ? { role } : undefined }),
        }),
    });

    it('allows requests when route has no required roles', () => {
        const reflector = { getAllAndOverride: jest.fn().mockReturnValue([]) };
        const guard = new RolesGuard(reflector as any);

        expect(guard.canActivate(makeContext())).toBe(true);
    });

    it('allows matching user role and blocks missing or mismatched role', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
        };
        const guard = new RolesGuard(reflector as any);

        expect(guard.canActivate(makeContext('ADMIN'))).toBe(true);
        expect(guard.canActivate(makeContext('CUSTOMER'))).toBe(false);
        expect(guard.canActivate(makeContext())).toBe(false);
    });
});
