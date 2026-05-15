import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './bases/interceptors/transform.interceptor';
import { LoggingInterceptor } from './bases/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './bases/filters/http-exception.filter';
import { HealthModule } from './modules/health/health.module';
//Add  e module here
@Module({
    imports: [
        PrismaModule, 
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        HealthModule, 

    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
    ],
})
export class AppModule {}