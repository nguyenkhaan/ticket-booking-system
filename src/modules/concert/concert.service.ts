import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateConcertDto, UpdateConcertDto } from './dto/concert.dto';
import { ConcertStatus } from '@prisma/client';

@Injectable()
export class ConcertService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createConcertDto: CreateConcertDto, userId: string) {
        return this.prisma.concert.create({
            data: {
                ...createConcertDto,
                startTime: new Date(createConcertDto.startTime),
                endTime: new Date(createConcertDto.endTime),
                createdById: userId,
            },
            include: {
                ticketCategories: true,
            },
        });
    }

    async findAll(status?: ConcertStatus) {
        return this.prisma.concert.findMany({
            where: status ? { status } : {},
            include: {
                ticketCategories: true,
            },
            orderBy: { startTime: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.concert.findUnique({
            where: { id },
            include: {
                ticketCategories: true,
            },
        });
    }

    async update(id: string, updateConcertDto: UpdateConcertDto) {
        const data: any = { ...updateConcertDto };
        if (updateConcertDto.startTime) {
            data.startTime = new Date(updateConcertDto.startTime);
        }
        if (updateConcertDto.endTime) {
            data.endTime = new Date(updateConcertDto.endTime);
        }

        return this.prisma.concert.update({
            where: { id },
            data,
            include: {
                ticketCategories: true,
            },
        });
    }

    async updateStatus(id: string, status: ConcertStatus) {
        return this.prisma.concert.update({
            where: { id },
            data: { status },
        });
    }

    async remove(id: string) {
        return this.prisma.concert.delete({
            where: { id },
        });
    }
}
