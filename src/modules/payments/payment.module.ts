import { Module } from '@nestjs/common';
import { PaymentsService } from './payment.service'; 
import { PaymentsController } from './payment.controller';
@Module({
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule {}
