import { getVersionFromPackageJson } from '@app/utils';
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

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
