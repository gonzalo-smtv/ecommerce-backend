import { getVersionFromPackageJson } from '@app/utils';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('z - Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return {
      status: 'ok',
      version: getVersionFromPackageJson(),
      checks: await this.health.check([() => this.db.pingCheck('database')]),
    };
  }
}
