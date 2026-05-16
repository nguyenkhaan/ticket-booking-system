import { Module } from '@nestjs/common';
import { VouchersService } from './voucher.service';
import { VoucherController } from './voucher.controller';
@Module({
    controllers: [VoucherController],
    providers: [VouchersService],
    exports: [VouchersService],
})
export class VouchersModule {}
