import {
    IsString,
    IsNotEmpty,
    IsArray,
    ValidateNested,
    IsInt,
    IsPositive,
    IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BookingItemDto {
    @ApiProperty({
        description: 'Ticket category ID',
    })
    @IsString()
    @IsNotEmpty()
    ticketCategoryId: string;

    @ApiProperty({
        description: 'Quantity of tickets',
        example: 2,
    })
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    quantity: number;
}

export class CreateBookingDto {
    @ApiProperty({
        description: 'Array of ticket category + quantity pairs',
        type: [BookingItemDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BookingItemDto)
    items: BookingItemDto[];

    @ApiPropertyOptional({
        description: 'Optional voucher code for discount',
    })
    @IsOptional()
    @IsString()
    voucherCode?: string;
}

export class BookingItemResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    ticketCategoryId: string;

    @ApiProperty()
    unitPrice: number;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    lineTotal: number;
}

export class BookingResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    bookingCode: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    subtotalAmount: number;

    @ApiProperty()
    discountAmount: number;

    @ApiProperty()
    totalAmount: number;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    paymentDueAt: Date;

    @ApiProperty({
        type: [BookingItemResponseDto],
    })
    bookingItems: BookingItemResponseDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class CancelBookingDto {
    @ApiPropertyOptional({
        description: 'Reason for cancellation',
    })
    @IsOptional()
    @IsString()
    reason?: string;
}
