import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/user.dto';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(createUserDto: CreateUserDto) {
        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(
            createUserDto.email,
        );
        if (existingUser) {
            throw new BadRequestException(
                'User with this email already exists',
            );
        }

        const user = await this.usersService.create(createUserDto);

        const token = this.generateToken(user);

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await this.usersService.validatePassword(
            loginDto.password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = this.generateToken({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        });

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }

    private generateToken(user: any): string {
        return this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
    }
}
