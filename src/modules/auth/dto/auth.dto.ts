import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'User email',
        example: 'user@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'Password123!',
    })
    @IsString()
    @MinLength(8)
    password: string;
}

export class AuthResponseDto {
    @ApiProperty()
    access_token: string;

    @ApiProperty()
    user: {
        id: string;
        email: string;
        fullName?: string;
        role: string;
    };
}
