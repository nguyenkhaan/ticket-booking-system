import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@/bases/decorators/role.decorator';
import { Roles } from '@/bases/decorators/role.decorator';
import { PaymentsService } from './payment.service';
import { PaymentStatus } from '@prisma/client';
@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('booking/:bookingId')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create payment intent for booking' })
    create(@Param('bookingId') bookingId: string) {
        return this.paymentsService.create(bookingId);
    }

    @Get('booking/:bookingId')
    @ApiOperation({ summary: 'Get payment status' })
    getByBookingId(@Param('bookingId') bookingId: string) {
        return this.paymentsService.findByBookingId(bookingId);
    }

    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    @Post(':bookingId/webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Payment webhook handler' })
    webhook(  //API ben ngoai se goi vao cho nay 
        @Param('bookingId') bookingId: string,
        @Body() body: { status: PaymentStatus; providerRef?: string },
    ) {
        //console.log(status) 
        return this.paymentsService.updatePaymentStatus(
            bookingId,
            body.status,
            body.providerRef,
        );
    }
}
