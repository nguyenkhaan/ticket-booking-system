/// <reference types="jest" />

import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
    it('logs before and after handler execution', (done) => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        const interceptor = new LoggingInterceptor();
        const next = { handle: jest.fn().mockReturnValue(of('ok')) };

        interceptor.intercept({} as any, next as any).subscribe({
            next: (value) => expect(value).toBe('ok'),
            complete: () => {
                expect(logSpy).toHaveBeenCalledWith('Before...');
                expect(logSpy).toHaveBeenCalledWith(
                    expect.stringMatching(/^After\.\.\. \d+ms$/),
                );
                logSpy.mockRestore();
                done();
            },
        });
    });
});
