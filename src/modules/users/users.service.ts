import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}
    async create(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const data = {
            fullName : createUserDto.fullName || null, 
            passwordHash : hashedPassword, 
            email : createUserDto.email
        }
        const user = await this.prismaService.user.create({
            data: {
                ...data,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async findAll() {
        return await this.prismaService.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findOne(id: string) {
        return this.prismaService.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findByEmail(email: string) {
        const user = await this.prismaService.user.findFirst({
            where: { email },
        });
        return user;
    }
    async validatePassword(password: string, hash: string) {
        const result = await bcrypt.compare(password, hash);
        return result;
    }
    async update(id: string, updateUserDto: UpdateUserDto) {
        return this.prismaService.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async remove(id: string) 
    {
        return this.prismaService.user.delete({
            where: { id },
            select: {
                id: true,
                email: true,
            },
        });
    }
}
