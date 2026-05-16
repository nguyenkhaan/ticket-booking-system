import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import { CreateVoucherDto } from './dto/voucher.dto';
import { UpdateVoucherDto } from './dto/voucher.dto';
import { ValidateVoucherDto } from './dto/voucher.dto';
@Injectable()
export class VouchersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createVoucherDto: CreateVoucherDto) {
        // Check if code already exists
        const existing = await this.prisma.voucher.findUnique({
            where: { code: createVoucherDto.code },
        });

        if (existing) {
            throw new BadRequestException('Voucher code already exists');
        }

        return this.prisma.voucher.create({
            data: {
                ...createVoucherDto,
                value: String(createVoucherDto.value),
                maxDiscountAmount: createVoucherDto.maxDiscountAmount
                    ? String(createVoucherDto.maxDiscountAmount)
                    : null,
                minOrderAmount: createVoucherDto.minOrderAmount
                    ? String(createVoucherDto.minOrderAmount)
                    : null,
                validFrom: new Date(createVoucherDto.validFrom),
                validTo: new Date(createVoucherDto.validTo),
            },
        });
    }

    async findAll() {
        return this.prisma.voucher.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.voucher.findUnique({
            where: { id },
            include: {
                redemptions: true,
            },
        });
    }

    async findByCode(code: string) {
        return this.prisma.voucher.findUnique({
            where: { code },
        });
    }

    async update(id: string, updateVoucherDto: UpdateVoucherDto) {
        const data: any = { ...updateVoucherDto };

        if (updateVoucherDto.value) {
            data.value = String(updateVoucherDto.value);
        }
        if (updateVoucherDto.maxDiscountAmount) {
            data.maxDiscountAmount = String(updateVoucherDto.maxDiscountAmount);
        }
        if (updateVoucherDto.minOrderAmount) {
            data.minOrderAmount = String(updateVoucherDto.minOrderAmount);
        }
        if (updateVoucherDto.validFrom) {
            data.validFrom = new Date(updateVoucherDto.validFrom);
        }
        if (updateVoucherDto.validTo) {
            data.validTo = new Date(updateVoucherDto.validTo);
        }

        return this.prisma.voucher.update({
            where: { id },
            data,
        });
    }

    async validate(
        validateVoucherDto: ValidateVoucherDto,
    ): Promise<{ valid: boolean; message?: string; discount?: number }> {
        const voucher = await this.findByCode(validateVoucherDto.code);

        if (!voucher) {
            return {
                valid: false,
                message: 'Voucher not found',
            };
        }

        const now = new Date();

        if (voucher.status !== 'ACTIVE') {
            return {
                valid: false,
                message: 'Voucher is not active',
            };
        }

        if (voucher.validFrom > now) {
            return {
                valid: false,
                message: 'Voucher is not yet valid',
            };
        }

        if (voucher.validTo < now) {
            return {
                valid: false,
                message: 'Voucher has expired',
            };
        }

        if (
            voucher.usageLimitTotal &&
            voucher.usedCount >= voucher.usageLimitTotal
        ) {
            return {
                valid: false,
                message: 'Voucher usage limit reached',
            };
        }

        if (
            voucher.minOrderAmount &&
            validateVoucherDto.orderAmount < Number(voucher.minOrderAmount)
        ) {
            return {
                valid: false,
                message: `Minimum order amount ${voucher.minOrderAmount} required`,
            };
        }

        // Calculate discount
        let discount = 0;
        if (voucher.type === 'PERCENT') {
            discount =
                (validateVoucherDto.orderAmount * Number(voucher.value)) / 100;
        } else {
            discount = Number(voucher.value);
        }

        if (voucher.maxDiscountAmount) {
            discount = Math.min(discount, Number(voucher.maxDiscountAmount));
        }

        return {
            valid: true,
            discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
        };
    }

    async remove(id: string) {
        return this.prisma.voucher.delete({
            where: { id },
        });
    }

    async getUsageReport(id: string) {
        const voucher = await this.findOne(id);

        if (!voucher) {
            throw new BadRequestException('Voucher not found');
        }

        return {
            voucherId: voucher.id,
            code: voucher.code,
            totalUsageLimit: voucher.usageLimitTotal,
            currentUsage: voucher.usedCount,
            remainingUsage: voucher.usageLimitTotal
                ? voucher.usageLimitTotal - voucher.usedCount
                : 'Unlimited',
            redemptions: voucher.redemptions,
        };
    }
}
