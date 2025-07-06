import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OpportunitiesModule } from 'src/opportunities/opportunities.module';

@Module({
  imports: [OpportunitiesModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
