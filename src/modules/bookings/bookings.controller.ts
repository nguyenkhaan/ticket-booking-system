import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { CancelBookingDto, CreateBookingDto } from './dto/bookings.dto';
import { BookingService } from './bookings.service';
import { Roles } from '@/bases/decorators/role.decorator';
import { UserRole } from '@/bases/decorators/role.decorator';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a booking for a concert',
    })
    @ApiBearerAuth()
    async create(
        @Req() req: Request,
        @Body() createBookingDto: CreateBookingDto,
    ) {
        const userId = (req.user as any).sub;
        return await this.bookingService.create(createBookingDto, userId);
    }
    @Get('code/:bookingCode')
    @ApiOperation({ summary: 'Get booking by booking code' })
    findByCode(@Param('bookingCode') bookingCode: string) {
        return this.bookingService.findByBookingCode(bookingCode);
    }
    @Get('/:id')
    @ApiOperation({ summary: 'Get a booking detail info' })
    async findOne(@Param('id') id: string) {
        return await this.bookingService.findOne(id);
    }
    @Get('user/my-bookings')
    @ApiOperation({ summary: 'Get current user bookings' })
    getUserBookings(@Req() req: Request) {
        const userId = (req.user as any).sub;
        return this.bookingService.findUserBookings(userId);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancel a booking' })
    cancel(
        @Param('id') id: string,
        @Body() cancelBookingDto: CancelBookingDto,
    ) {
        return this.bookingService.cancel(id, cancelBookingDto.reason);
    }

    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Post(':id/confirm')
    @ApiOperation({ summary: 'Confirm a booking (Operator/Admin only)' })
    confirm(@Param('id') id: string) {
        return this.bookingService.confirmBooking(id);
    }
}
