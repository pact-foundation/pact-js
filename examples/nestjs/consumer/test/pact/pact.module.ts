import { Module } from '@nestjs/common';
import { PactConsumerModule } from 'nestjs-pact';
import { PactConsumerConfigOptionsService } from './pact-consumer-config-options.service';
import { AppModule } from '../../src/app.module';

@Module({
  imports: [
    PactConsumerModule.registerAsync({
      imports: [AppModule],
      useClass: PactConsumerConfigOptionsService,
    }),
  ],
})
export class PactModule {}
