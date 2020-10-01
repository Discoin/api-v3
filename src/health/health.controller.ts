import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  DNSHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { convert } from 'convert';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dns: DNSHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.dns.pingCheck('network-ping', 'https://1.1.1.1'),
      () =>
        this.db.pingCheck('db-ping', {
          timeout: convert(5).from('seconds').to('milliseconds'),
        }),
      () => this.memory.checkHeap('memory-heap', convert(500).from('megabytes').to('bytes')),
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: process.env.NODE_ENV === 'production' ? 0.9 : 1,
        }),
    ]);
  }
}
