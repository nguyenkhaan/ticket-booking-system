import { Module } from '@nestjs/common';
import { BookingService } from './bookings.service';
import { BookingController } from './bookings.controller';

@Module({
    controllers: [BookingController],
    providers: [BookingService],
    exports: [BookingService],
})
export class BookingsModule {}
