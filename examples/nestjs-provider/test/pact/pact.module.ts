import { Module } from "@nestjs/common"
import { PactProviderModule } from "nestjs-pact"
import { PactProviderConfigOptionsService } from "./pact-provider-config-options.service"
import { AppRepository } from "../../src/app.repository"
import { AppModule } from "../../src/app.module"

@Module({
  imports: [
    PactProviderModule.registerAsync({
      imports: [AppModule],
      useClass: PactProviderConfigOptionsService,
      inject: [AppRepository],
    }),
  ],
})
export class PactModule {}
