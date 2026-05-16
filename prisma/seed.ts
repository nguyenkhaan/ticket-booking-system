import {
    PrismaClient,
    UserRole,
    ConcertStatus,
    VoucherType,
    VoucherStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
    }),
});
async function main() {
    console.log('🌱 Seeding database...');
    const DEFAULT_PASSWORD = 'password123'
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    // Create admin user
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@booking-system.com' },
        update: {},
        create: {
            email: 'admin@booking-system.com',
            passwordHash:
                hashedPassword, 
            fullName: 'Admin User',
            role: UserRole.ADMIN,
        },
    });

    // Create operator user
    const operatorUser = await prisma.user.upsert({
        where: { email: 'operator@booking-system.com' },
        update: {},
        create: {
            email: 'operator@booking-system.com',
            passwordHash: hashedPassword, 
            fullName: 'Operator User',
            role: UserRole.OPERATOR,
        },
    });

    // Create customer user
    const customerUser = await prisma.user.upsert({
        where: { email: 'customer@booking-system.com' },
        update: {},
        create: {
            email: 'customer@booking-system.com',
            passwordHash: hashedPassword, 
            fullName: 'Customer User',
            role: UserRole.CUSTOMER,
        },
    });

    // Create sample concert
    const concert = await prisma.concert.upsert({
        where: { id: 'demo-concert-001' },
        update: {},
        create: {
            id: 'demo-concert-001',
            title: 'Summer Music Festival 2024',
            description:
                'An amazing summer festival featuring top artists from around the world',
            venue: 'Central Park Amphitheater',
            startTime: new Date('2024-07-15T20:00:00Z'),
            endTime: new Date('2024-07-15T23:00:00Z'),
            status: ConcertStatus.PUBLISHED,
            createdById: operatorUser.id,
        },
    });

    // Create ticket categories
    const vipCategory = await prisma.ticketCategory.upsert({
        where: { id: 'ticket-vip-001' },
        update: {},
        create: {
            id: 'ticket-vip-001',
            concertId: concert.id,
            name: 'VIP',
            price: '250.00',
            currency: 'USD',
            totalQuantity: 100,
            reservedQuantity: 0,
            soldQuantity: 0,
            maxPerOrder: 5,
        },
    });

    const standardCategory = await prisma.ticketCategory.upsert({
        where: { id: 'ticket-standard-001' },
        update: {},
        create: {
            id: 'ticket-standard-001',
            concertId: concert.id,
            name: 'Standard',
            price: '150.00',
            currency: 'USD',
            totalQuantity: 300,
            reservedQuantity: 0,
            soldQuantity: 0,
            maxPerOrder: 10,
        },
    });

    const economyCategory = await prisma.ticketCategory.upsert({
        where: { id: 'ticket-economy-001' },
        update: {},
        create: {
            id: 'ticket-economy-001',
            concertId: concert.id,
            name: 'Economy',
            price: '75.00',
            currency: 'USD',
            totalQuantity: 500,
            reservedQuantity: 0,
            soldQuantity: 0,
            maxPerOrder: 15,
        },
    });

    // Create sample vouchers
    const percentVoucher = await prisma.voucher.upsert({
        where: { code: 'SUMMER20' },
        update: {},
        create: {
            code: 'SUMMER20',
            type: VoucherType.PERCENT,
            value: '20',
            maxDiscountAmount: '100.00',
            minOrderAmount: '100.00',
            usageLimitTotal: 100,
            usageLimitPerUser: 1,
            usedCount: 0,
            validFrom: new Date('2024-06-01T00:00:00Z'),
            validTo: new Date('2024-08-31T23:59:59Z'),
            status: VoucherStatus.ACTIVE,
        },
    });

    const fixedVoucher = await prisma.voucher.upsert({
        where: { code: 'FLAT30' },
        update: {},
        create: {
            code: 'FLAT30',
            type: VoucherType.FIXED,
            value: '30',
            minOrderAmount: '150.00',
            usageLimitTotal: 50,
            usageLimitPerUser: 2,
            usedCount: 0,
            validFrom: new Date('2024-06-15T00:00:00Z'),
            validTo: new Date('2024-09-15T23:59:59Z'),
            status: VoucherStatus.ACTIVE,
        },
    });

    console.log('Seeding completed successfully!');
    console.log('Created:');
    console.log(`  - ${adminUser.email} (Admin)`);
    console.log(`  - ${operatorUser.email} (Operator)`);
    console.log(`  - ${customerUser.email} (Customer)`);
    console.log(`  - 1 Concert: ${concert.title}`);
    console.log(`  - 3 Ticket Categories: VIP, Standard, Economy`);
    console.log(`  - 2 Vouchers: SUMMER20 (20% off), FLAT30 ($30 off)`);
    console.log('\nDefault password for all users: password123');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Seed error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
