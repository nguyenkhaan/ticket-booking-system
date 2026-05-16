import {
    BadRequestException,
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/bookings.dto';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class BookingService {
    constructor(private readonly prismaService: PrismaService) {}
    //_______________________________ HELPER USING BOOKING
    private generateCode(): string {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `BK-${timestamp}-${random}`;
    }
    //____________________________ BUSSINESS
    async create(createBookingDto: CreateBookingDto, userId: string) {
        //Create an impotency key --====== > No No No, Prevent user from waiting too long
        const payloadHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(createBookingDto))
            .digest('hex');
        const idempotencyKey = `${userId}-${payloadHash}`; //I will cache it to the redis later
        const existingBooking = await this.prismaService.booking.findFirst({
            where: {
                idempotencyKey,
            },
            include: { bookingItems: true },
        });
        if (existingBooking) return existingBooking; // neu ton tai roi thi tra ve cho nguoi dung luon => Tranh tuong hop query db them dan den mat thoi gian cua nguoi dung
        let subTotal = 0;
        const bookingItemsData: any = [];
        // Create and validate booking item data . Checking if aanu booking item exists ??
        for (const item of createBookingDto.items) {
            const ticketCategory =
                await this.prismaService.ticketCategory.findFirst({
                    where: {
                        id: item.ticketCategoryId,
                    },
                });
            if (!ticketCategory)
                throw new BadRequestException(
                    `Ticket with id ${item.ticketCategoryId} not found`,
                );
            if (ticketCategory.maxPerOrder < item.quantity)
                throw new BadRequestException(
                    `Cannot buy more than ${ticketCategory.maxPerOrder} with ticket ${ticketCategory.name}, (${ticketCategory.id})`,
                );
            const lineTotal = Number(ticketCategory.price) * item.quantity;
            subTotal += lineTotal;
            bookingItemsData.push({
                ticketCategoryId: ticketCategory.id,
                lineTotal,
                quantity: item.quantity,
                unitPrice: ticketCategory.price,
            });
        }
        let sell = 0; //Giam gia
        if (createBookingDto.voucherCode) {
            const voucher = await this.prismaService.voucher.findFirst({
                where: { code: createBookingDto.voucherCode },
            });
            if (!voucher)
                throw new BadRequestException(
                    `Cannot found voucher with ${createBookingDto.voucherCode}`,
                );
            //Kiem tra voucher co expire hay khong
            const now = new Date();
            if (voucher.validFrom > now || now > voucher.validTo)
                throw new BadRequestException(
                    `Voucher ${createBookingDto.voucherCode} has been expired`,
                );
            if (voucher.usedCount > (voucher.usageLimitTotal || Infinity))
                //null co nghia la khong co han muc => Infinity
                throw new BadRequestException(
                    `Voucher ${createBookingDto.voucherCode} has been reached the limit usage`,
                );
            //Gia tri toi thieu cua don hang de ap dung voucher
            if (
                voucher.minOrderAmount &&
                subTotal < Number(voucher.minOrderAmount)
            )
                throw new BadRequestException(
                    'Cannot apply voucher because total ticket price does not met the min required',
                );
            //Calculate discount
            if (voucher.type === 'PERCENT')
                sell = (subTotal * Number(voucher.value)) / 100;
            else sell = Number(voucher.value);
            if (voucher.maxDiscountAmount)
                sell = Math.min(Number(voucher.maxDiscountAmount), sell);
        }
        const total = Math.max(0, subTotal - sell);
        const bookingCode = this.generateCode();
        const paymentDueAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); //10 days later
        try {
            const booking = await this.prismaService.$transaction(
                async (tx) => {
                    for (const item of createBookingDto.items) {
                        const ticketCategory =
                            await tx.ticketCategory.findFirst({
                                where: {
                                    id: item.ticketCategoryId,
                                },
                            });
                        if (ticketCategory) {
                            const remain =
                                ticketCategory.totalQuantity -
                                ticketCategory.soldQuantity -
                                ticketCategory.reservedQuantity;
                            if (remain < item.quantity)
                                throw new ConflictException(
                                    `Not enough remain ticket for ${ticketCategory.name}. Remain: ${remain}`,
                                );
                            await tx.ticketCategory.update({
                                where: { id: ticketCategory.id },
                                data: {
                                    reservedQuantity: {
                                        increment: item.quantity,
                                    },
                                },
                            });
                        }
                    }
                    //Create new booking
                    const newBooking = await tx.booking.create({
                        data: {
                            bookingCode,
                            userId,
                            subtotalAmount: subTotal,
                            discountAmount: sell,
                            totalAmount: total,
                            voucherId: createBookingDto.voucherCode
                                ? (
                                      await tx.voucher.findUnique({
                                          where: {
                                              code: createBookingDto.voucherCode,
                                          },
                                      })
                                  )?.id
                                : null,
                            idempotencyKey,
                            paymentDueAt,
                            bookingItems: {
                                create: bookingItemsData,
                            },
                        },
                        include: { bookingItems: true },
                    });
                    //Update the voucher redemption to tracking user voucher usage
                    if (createBookingDto.voucherCode && newBooking.voucherId) {
                        await tx.voucherRedemption.create({
                            data: {
                                voucherId: newBooking.voucherId,
                                bookingId: newBooking.id,
                                userId,
                                discountAmount: sell,
                            },
                        });
                        //Update the voucher use number yes yes yes
                        await tx.voucher.update({
                            where: { code: createBookingDto.voucherCode },
                            data: { usedCount: { increment: 1 } },
                        });
                    }
                    return newBooking;
                },
            );
            return booking;
        } catch (err) {
            console.log(`Create booking with error`, err);
            throw err;
        }
    }
    async findOne(id: string) {
        return this.prismaService.booking.findUnique({
            where: { id },
            include: {
                bookingItems: true,
                voucher: true,
                payment: true,
            },
        });
    }

    async findByBookingCode(bookingCode: string) {
        return this.prismaService.booking.findUnique({
            where: { bookingCode },
            include: {
                bookingItems: true,
                voucher: true,
                payment: true,
            },
        });
    }

    async findUserBookings(userId: string) {
        return this.prismaService.booking.findMany({
            where: { userId },
            include: {
                bookingItems: true,
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async cancel(id: string, reason?: string) {
        const booking = await this.prismaService.booking.findUnique({
            where: { id },
        });

        if (!booking) {
            throw new BadRequestException('Booking not found');
        }

        // Release reserved tickets
        const bookingItems = await this.prismaService.bookingItem.findMany({
            where: { bookingId: id },
        });

        try {
            await this.prismaService.$transaction(async (tx) => {
                for (const item of bookingItems) {
                    await tx.ticketCategory.update({
                        where: { id: item.ticketCategoryId },
                        data: {
                            reservedQuantity: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }

                await tx.booking.update({
                    where: { id },
                    data: { status: 'CANCELLED' },
                });
            });
        } catch (error) {
            throw new BadRequestException('Failed to cancel booking');
        }

        return this.findOne(id);
    }

    async confirmBooking(id: string) {
        const booking = await this.prismaService.booking.findUnique({
            where: { id },
        });

        if (!booking) {
            throw new BadRequestException('Booking not found');
        }

        const bookingItems = await this.prismaService.bookingItem.findMany({
            where: { bookingId: id },
        });

        try {
            await this.prismaService.$transaction(async (tx) => {
                for (const item of bookingItems) {
                    // Move from reserved to sold
                    await tx.ticketCategory.update({
                        where: { id: item.ticketCategoryId },
                        data: {
                            reservedQuantity: {
                                decrement: item.quantity,
                            },
                            soldQuantity: {
                                increment: item.quantity,
                            },
                        },
                    });
                }

                await tx.booking.update({
                    where: { id },
                    data: { status: 'CONFIRMED' },
                });
            });
        } catch (error) {
            throw new BadRequestException('Failed to confirm booking');
        }

        return this.findOne(id);
    }
}
