import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsNumber,
    IsPositive,
    IsOptional,
    IsDateString,
    IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VoucherType } from '@prisma/client';

export class CreateVoucherDto {
    @ApiProperty({
        description: 'Unique voucher code',
        example: 'SUMMER2024',
    })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({
        description: 'Discount type',
        enum: VoucherType,
    })
    @IsEnum(VoucherType)
    type: VoucherType;

    @ApiProperty({
        description: 'Discount value (percentage or fixed amount)',
        example: 20,
    })
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    value: number;

    @ApiPropertyOptional({
        description: 'Maximum discount amount (for percentage type)',
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    maxDiscountAmount?: number;

    @ApiPropertyOptional({
        description: 'Minimum order amount required',
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    minOrderAmount?: number;

    @ApiPropertyOptional({
        description: 'Total usage limit',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    usageLimitTotal?: number;

    @ApiPropertyOptional({
        description: 'Usage limit per user',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    usageLimitPerUser?: number;

    @ApiProperty({
        description: 'Valid from date (ISO 8601)',
        example: '2024-06-01T00:00:00Z',
    })
    @IsDateString()
    validFrom: string;

    @ApiProperty({
        description: 'Valid to date (ISO 8601)',
        example: '2024-08-31T23:59:59Z',
    })
    @IsDateString()
    validTo: string;
}

export class UpdateVoucherDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(VoucherType)
    type?: VoucherType;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    value?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxDiscountAmount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minOrderAmount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    usageLimitTotal?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    usageLimitPerUser?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    validFrom?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    validTo?: string;
}

export class ValidateVoucherDto {
    @ApiProperty({
        description: 'Voucher code to validate',
    })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({
        description: 'Order amount for validation',
    })
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    orderAmount: number;
}

export class VoucherResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    code: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    value: number;

    @ApiProperty()
    maxDiscountAmount?: number;

    @ApiProperty()
    minOrderAmount?: number;

    @ApiProperty()
    usageLimitTotal?: number;

    @ApiProperty()
    usageLimitPerUser: number;

    @ApiProperty()
    usedCount: number;

    @ApiProperty()
    validFrom: Date;

    @ApiProperty()
    validTo: Date;

    @ApiProperty()
    status: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
