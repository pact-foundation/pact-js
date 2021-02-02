import { Module } from "@nestjs/common"
import { PactProducerModule } from "nestjs-pact"
import { PactProducerConfigOptionsService } from "./pact-producer-config-options.service"
import { AppRepository } from "../../src/app.repository"
import { AppModule } from "../../src/app.module"

@Module({
  imports: [
    PactProducerModule.registerAsync({
      imports: [AppModule],
      useClass: PactProducerConfigOptionsService,
      inject: [AppRepository],
    }),
  ],
})
export class PactModule {}
