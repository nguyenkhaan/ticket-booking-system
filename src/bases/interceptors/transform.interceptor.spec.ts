/// <reference types="jest" />

import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
    it('wraps response data in the standard success envelope', (done) => {
        const interceptor = new TransformInterceptor();
        const next = {
            handle: jest.fn(() => of({ id: 'booking-1' })),
        };

        interceptor.intercept({} as any, next).subscribe((result) => {
            expect(result).toEqual({
                success: true,
                data: { id: 'booking-1' },
            });
            done();
        });
    });
});
