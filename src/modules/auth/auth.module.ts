import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'jwt',
        }),
        JwtModule.registerAsync({
            inject: [ConfigService],

            useFactory: (configService: ConfigService): JwtModuleOptions => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.getOrThrow<string>(
                        'JWT_EXPIRES_IN',
                    ) as any,
                },
            }),
        }),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [PassportModule, JwtModule],
})
export class AuthModule {}
