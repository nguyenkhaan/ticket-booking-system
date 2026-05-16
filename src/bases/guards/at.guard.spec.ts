/// <reference types="jest" />

import { AtGuard } from './at.guard';

describe('AtGuard', () => {
    const context: any = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
    };

    it('allows public routes without passport jwt guard', () => {
        const reflector = { getAllAndOverride: jest.fn().mockReturnValue(true) };
        const guard = new AtGuard(reflector as any);

        expect(guard.canActivate(context)).toBe(true);
    });
});
