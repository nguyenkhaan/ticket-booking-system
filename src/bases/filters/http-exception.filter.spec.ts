/// <reference types="jest" />

import { BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
    it('formats http exception response body', () => {
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const host: any = {
            switchToHttp: () => ({
                getResponse: () => ({ status }),
                getRequest: () => ({ url: '/tickets' }),
            }),
        };

        new HttpExceptionFilter().catch(
            new BadRequestException('Invalid ticket'),
            host,
        );

        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                path: '/tickets',
                notifi: 'Cloudian Notification!!!',
                message: 'Invalid ticket',
            }),
        );
    });
});
