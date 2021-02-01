import { Injectable } from "@nestjs/common"
import { PactProducerOptionsFactory, PactProducerOptions } from "nestjs-pact"
import { AppRepository } from "../../src/app.repository"

@Injectable()
export class PactProducerConfigOptionsService
  implements PactProducerOptionsFactory {
  public constructor(private readonly animalRepository: AppRepository) {}

  public createPactProducerOptions(): PactProducerOptions {
    let token

    return {
      provider: "Animal Profile Service",
      logLevel: "debug",

      requestFilter: (req, res, next) => {
        console.log(
          "Middleware invoked before provider API - injecting Authorization token"
        )
        req.headers.MY_SPECIAL_HEADER = "my special value"

        // e.g. ADD Bearer token
        req.headers.authorization = `Bearer ${token}`
        next()
      },

      stateHandlers: {
        "Has no animals": async () => {
          this.animalRepository.clear()
          token = "1234"

          return "Animals removed to the db"
        },
        "Has some animals": async () => {
          token = "1234"
          this.animalRepository.importData()

          return "Animals added to the db"
        },
        "Has an animal with ID 1": async () => {
          token = "1234"
          this.animalRepository.importData()

          return "Animals added to the db"
        },
        "is not authenticated": async () => {
          token = ""

          return "Invalid bearer token generated"
        },
      },

      // Fetch pacts from broker
      pactBrokerUrl: "https://test.pact.dius.com.au/",
      consumerVersionTags: ["prod"],
      providerVersionTags: ["prod"],
      enablePending: true,
      pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
      pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
      publishVerificationResult: true,
      providerVersion: "1.0.0",
    }
  }
}
