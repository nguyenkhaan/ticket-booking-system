import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../../bases/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get('liveness')
  @ApiOperation({ summary: 'Server status right now' })
  liveness() {
    return this.healthService.liveness();
  }

  @Public()
  @Get('readiness')
  @ApiOperation({ summary: 'Checking database connection of server' })
  readiness() {
    return this.healthService.readiness();
  }
}
