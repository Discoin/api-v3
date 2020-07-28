import { Module } from '@nestjs/common';
import { BotsModule } from 'src/bots/bots.module';
import { AuthService } from './auth.service';

@Module({
  imports: [BotsModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
