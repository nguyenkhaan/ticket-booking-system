import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsInt,
    IsPositive,
    IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTicketCategoryDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    concertId: string;

    @ApiProperty({
        description: 'Category name (VIP, Standard, etc)',
        example: 'VIP',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Ticket price',
        example: 150.5,
    })
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({
        description: 'Total quantity available',
        example: 500,
    })
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    totalQuantity: number;

    @ApiPropertyOptional({
        description: 'Max tickets per order',
        example: 10,
        default: 10,
    })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @IsPositive()
    maxPerOrder?: number;
}

export class UpdateTicketCategoryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    totalQuantity?: number;

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    maxPerOrder?: number;
}

export class TicketCategoryResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    concertId: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    totalQuantity: number;

    @ApiProperty()
    reservedQuantity: number;

    @ApiProperty()
    soldQuantity: number;

    @ApiProperty()
    availableQuantity: number;

    @ApiProperty()
    maxPerOrder: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
