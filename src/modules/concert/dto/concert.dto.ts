import {
    IsString,
    IsDateString,
    IsOptional,
    IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConcertDto {
    @ApiProperty({
        description: 'Concert title',
        example: 'Summer Music Festival 2024',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({
        description: 'Concert description',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Venue name',
        example: 'Madison Square Garden',
    })
    @IsString()
    @IsNotEmpty()
    venue: string;

    @ApiProperty({
        description: 'Concert start date/time (ISO 8601)',
        example: '2024-07-15T20:00:00Z',
    })
    @IsDateString()
    startTime: string;

    @ApiProperty({
        description: 'Concert end date/time (ISO 8601)',
        example: '2024-07-15T23:00:00Z',
    })
    @IsDateString()
    endTime: string;
}

export class UpdateConcertDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    venue?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startTime?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endTime?: string;
}

export class ConcertResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description?: string;

    @ApiProperty()
    venue: string;

    @ApiProperty()
    startTime: Date;

    @ApiProperty()
    endTime: Date;

    @ApiProperty()
    status: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
