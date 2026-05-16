import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/user.dto';
import { Public } from '../../bases/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto, AuthResponseDto } from './dto/auth.dto';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() createUserDto: CreateUserDto) {
        return await this.authService.register(createUserDto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user' })
    async login(@Body() loginDto: LoginDto)  {
        return await this.authService.login(loginDto);
    }
}
