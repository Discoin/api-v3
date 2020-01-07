import {
	TerminusEndpoint,
	TerminusOptionsFactory,
	DNSHealthIndicator,
	TerminusModuleOptions,
	MemoryHealthIndicator,
	DiskHealthIndicator,
	TypeOrmHealthIndicator
} from '@nestjs/terminus';
import {Injectable} from '@nestjs/common';
import {environment} from 'src/util/config';
import {Environments} from 'src/util/constants';
@Injectable()
export class TerminusOptionsService implements TerminusOptionsFactory {
	constructor(
		private readonly _dns: DNSHealthIndicator,
		private readonly _db: TypeOrmHealthIndicator,
		private readonly _memory: MemoryHealthIndicator,
		private readonly _disk: DiskHealthIndicator
	) {}

	createTerminusOptions(): TerminusModuleOptions {
		const healthEndpoint: TerminusEndpoint = {
			url: '/health',
			healthIndicators: [
				async () => this._dns.pingCheck('network', 'https://1.1.1.1', {timeout: 10_000}),
				// This can fail when the app is just starting and the database connection is still initializing
				async () => this._db.pingCheck('database', {timeout: 3000}),
				// Fail if used memory <= 150MB
				async () => this._memory.checkHeap('memoryHeap', 150 * 1024 * 1024),
				// Fail if allocated memory <= 1024MB
				async () => this._memory.checkRSS('memoryAllocated', 1024 * 1024 * 1024),
				async () =>
					this._disk.checkStorage('storage', {
						path: '/',
						thresholdPercent: environment === Environments.PROD ? 0.75 : 1
					})
			]
		};
		return {
			endpoints: [healthEndpoint]
		};
	}
}
