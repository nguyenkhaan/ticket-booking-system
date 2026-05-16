import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'Password123!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiPropertyOptional({
        description: 'User full name',
        example: 'John Doe',
    })
    @IsOptional()
    @IsString()
    fullName?: string;
}

export class UpdateUserDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fullName?: string;
}

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    fullName?: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
