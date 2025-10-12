import { getVersionFromPackageJson } from '@app/utils';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Checks the health status of the application and its dependencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        version: { type: 'string', example: '1.0.0' },
        checks: { type: 'object' },
      },
    },
  })
  @HealthCheck()
  async check() {
    return {
      status: 'ok',
      version: getVersionFromPackageJson(),
      checks: await this.health.check([() => this.db.pingCheck('database')]),
    };
  }
}
