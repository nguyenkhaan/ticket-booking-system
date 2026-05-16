import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
    CreateTicketCategoryDto,
    UpdateTicketCategoryDto,
} from './dto/ticket.dto';

@Injectable()
export class TicketService {
    constructor(private readonly prismaService: PrismaService) {}
    async findByConcert(concertId: string) {
        return await this.prismaService.ticketCategory.findMany({
            where: { concertId },
        });
    }

    async findOne(id: string) {
        return this.prismaService.ticketCategory.findUnique({
            where: { id },
        });
    }

    async update(id: string, updateTicketCategoryDto: UpdateTicketCategoryDto) {
        const data: any = { ...updateTicketCategoryDto };
        if (updateTicketCategoryDto.price) {
            data.price = String(updateTicketCategoryDto.price);
        }

        return this.prismaService.ticketCategory.update({
            where: { id },
            data,
        });
    }
    async create(createTicketCategoryDto: CreateTicketCategoryDto) {
        // Verify concert exists
        const concert = await this.prismaService.concert.findUnique({
            where: { id: createTicketCategoryDto.concertId },
        });

        if (!concert) {
            throw new BadRequestException('Concert not found');
        }

        return this.prismaService.ticketCategory.create({
            data: {
                ...createTicketCategoryDto,
                price: String(createTicketCategoryDto.price),
            },
        });
    }
    async getAvailableQuantity(id: string): Promise<number> {
        const category = await this.prismaService.ticketCategory.findUnique({
            where: { id },
        });

        if (!category) {
            throw new BadRequestException('Ticket category not found');
        }

        return (
            category.totalQuantity -
            category.reservedQuantity -
            category.soldQuantity
        );
    }

    async remove(id: string) {
        return this.prismaService.ticketCategory.delete({
            where: { id },
        });
    }
}
