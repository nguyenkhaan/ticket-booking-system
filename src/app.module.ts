import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './bases/interceptors/transform.interceptor';
import { LoggingInterceptor } from './bases/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './bases/filters/http-exception.filter';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AtGuard } from './bases/guards/at.guard';
import { RolesGuard } from './bases/guards/roles.guard';
import { BookingsModule } from './modules/bookings/bookings.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { ConcertModule } from './modules/concert/concert.module';
import { PaymentsModule } from './modules/payments/payment.module';
import { VouchersModule } from './modules/voucher/voucher.module';
//Add  e module here
@Module({
    imports: [
        PrismaModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        HealthModule,
        UsersModule,
        AuthModule,
        BookingsModule,
        TicketModule,
        ConcertModule, 
        PaymentsModule, 
        VouchersModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_GUARD,
            useClass: AtGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
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
