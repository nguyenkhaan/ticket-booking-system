import { Module } from '@nestjs/common';
import { AuditLogController } from './audit.controller'; 
import { AuditLogService } from './audit.service';
@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}