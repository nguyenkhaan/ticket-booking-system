import { Roles, UserRole } from '@/bases/decorators/role.decorator';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditLogService } from './audit.service';

@Controller('audit-logs')
@ApiTags('Audit Log')
@Roles(UserRole.ADMIN)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}
    @Get()
    @ApiOperation({ summary: 'Get all audit logs' })
    findAll(
        @Query('limit', new ParseIntPipe()) limit: number = 100,
        @Query('offset', new ParseIntPipe()) offset: number = 0,
    ) {
        return this.auditLogService.findAll(limit, offset);
    }

    @Get('resource/:resourceType/:resourceId')
    @ApiOperation({ summary: 'Get audit logs for a resource' })
    findByResource(
        @Param('resourceType') resourceType: string,
        @Param('resourceId') resourceId: string,
    ) {
        return this.auditLogService.findByResource(resourceType, resourceId);
    }

    @Get('actor/:actorUserId')
    @ApiOperation({ summary: 'Get audit logs by actor' })
    findByActor(@Param('actorUserId') actorUserId: string) {
        return this.auditLogService.findByActor(actorUserId);
    }
}
