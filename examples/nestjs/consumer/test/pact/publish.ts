import { NestFactory } from "@nestjs/core"
import { Publisher } from "@pact-foundation/pact"
import { PactModuleProviders } from "nestjs-pact"
import { PactModule } from "./pact.module"
;(async () => {
  const app = await NestFactory.createApplicationContext(PactModule)

  const publisher: Publisher = app.get(PactModuleProviders.PactPublisher)
  const a = 1
  // const logger: LoggerService = app.get(Logger);

  if (process.env.CI !== "true") {
    console.log("Skipping Pact publish as not on CI")
    process.exit(0)
  }

  try {
    await publisher.publishPacts()

    console.log("Pact contract publishing complete!")
    console.log("")
    console.log("Head over to https://test.pact.dius.com.au/ and login with")
    console.log("=> Username: dXfltyFMgNOFZAxr8io9wJ37iUpY42M")
    console.log("=> Password: O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1")
    console.log("to see your published contracts.")
  } catch (e) {
    console.error("Pact contract publishing failed: ", e)
  }
})()
