import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(bookingId: string, provider: string = 'stripe') {
        const booking = await this.prismaService.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new BadRequestException('Booking not found');
        }

        const existingPayment = await this.prismaService.payment.findUnique({
            where: { bookingId },
        });

        if (existingPayment) {
            return existingPayment;
        }

        return this.prismaService.payment.create({
            data: {
                bookingId,
                provider,
                amount: booking.totalAmount,
            },
        });
    }

    async findByBookingId(bookingId: string) {
        return this.prismaService.payment.findUnique({
            where: { bookingId },
        });
    }

    async updatePaymentStatus(
        bookingId: string,
        status: PaymentStatus,
        providerRef?: string,
    ) {
        const payment = await this.prismaService.payment.findUnique({
            where: { bookingId },
        });

        if (!payment) {
            throw new BadRequestException('Payment not found');
        }

        const paidAt = status === 'SUCCESS' ? new Date() : null;

        return this.prismaService.payment.update({
            where: { id: payment.id },
            data: {
                status,
                providerRef: providerRef || payment.providerRef,
                paidAt,
            },
        });
    }
}
