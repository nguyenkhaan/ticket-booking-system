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
    @ApiBearerAuth('access-token')
    async create(
        @Req() req: Request,
        @Body() createBookingDto: CreateBookingDto,
    ) {
        const userId = (req.user as any).sub;
        return await this.bookingService.create(createBookingDto, userId);
    }
    @Get('code/:bookingCode')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get booking by booking code' })
    async findByCode(@Param('bookingCode') bookingCode: string) {
        return await this.bookingService.findByBookingCode(bookingCode);
    }
    @Get('/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get a booking detail info' })
    async findOne(@Param('id') id: string) {
        return await this.bookingService.findOne(id);
    }
    @Get('user/my-bookings')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get current user bookings' })
    async getUserBookings(@Req() req: Request) {
        const userId = (req.user as any).sub;
        return await this.bookingService.findUserBookings(userId);
    }

    @Post(':id/cancel')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Cancel a booking' })
    async cancel(
        @Param('id') id: string,
        @Body() cancelBookingDto: CancelBookingDto,
    ) {
        return await this.bookingService.cancel(id, cancelBookingDto.reason);
    }
    @ApiBearerAuth('access-token')
    @Roles(UserRole.OPERATOR, UserRole.ADMIN)
    @Post(':id/confirm')
    @ApiOperation({ summary: 'Confirm a booking (Operator/Admin only)' })
    async confirm(@Param('id') id: string) {
        return await this.bookingService.confirmBooking(id);
    }
}
