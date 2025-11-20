import { Module } from '@nestjs/common';
import { ParkirService } from './parkir.service';
import { ParkirController } from './parkir.controller';

@Module({
  providers: [ParkirService],
  controllers: [ParkirController]
})
export class ParkirModule {}
