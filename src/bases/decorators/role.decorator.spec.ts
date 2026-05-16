/// <reference types="jest" />

import 'reflect-metadata';
import { ROLES_KEY, Roles, UserRole } from './role.decorator';

describe('Roles decorator', () => {
    it('stores allowed roles as metadata', () => {
        class TestController {
            @Roles(UserRole.ADMIN, UserRole.OPERATOR)
            handler() {
                return true;
            }
        }

        const roles = Reflect.getMetadata(
            ROLES_KEY,
            TestController.prototype.handler,
        );

        expect(roles).toEqual([UserRole.ADMIN, UserRole.OPERATOR]);
    });
});
