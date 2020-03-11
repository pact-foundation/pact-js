const { VerifierV3 } = require("@pact-foundation/pact/dist/v3")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const { server, importData, animalRepository } = require("../provider.js")
const path = require("path")

server.listen(8081, () => {
  console.log("Animal Profile Service listening on http://localhost:8081")
})

// Verify that the provider meets all consumer expectations
describe("Pact Verification", () => {
  it("validates the expectations of Matching Service", () => {
    let token = "INVALID TOKEN"

    let opts = {
      provider: "Animal Profile Service",
      providerBaseUrl: "http://localhost:8081",

      requestFilter: req => {
        console.log(
          "Middleware invoked before provider API - injecting Authorization token"
        )

        req.headers["MY_SPECIAL_HEADER"] = "my special value"

        // e.g. ADD Bearer token
        req.headers["authorization"] = `Bearer ${token}`

        return req
      },

      stateHandlers: {
        "Has no animals": () => {
          animalRepository.clear()
          token = "1234"
          return Promise.resolve({description: `Animals removed to the db`})
        },
        "Has some animals": () => {
          token = "1234"
          importData()
          return Promise.resolve({description: `Animals added to the db`, count: animalRepository.count()})
        },
        "Has an animal with ID": (parameters) => {
          token = "1234"
          importData()
          animalRepository.first().id = parameters.id
          return Promise.resolve({description: `Animal with ID ${parameters.id} added to the db`, id: parameters.id})
        },
        "is not authenticated": () => {
          token = ""
          return Promise.resolve({description: `Invalid bearer token generated`})
        },
      },

      // Fetch pacts from broker
      pactBrokerUrl: "https://test.pact.dius.com.au/",

      // Fetch from broker with given tags
      tags: ["prod"],

      // Specific Remote pacts (doesn't need to be a broker)
      // pactUrls: ['https://test.pact.dius.com.au/pacts/provider/Animal%20Profile%20Service/consumer/Matching%20Service/latest'],
      // Local pacts
      // pactUrls: [
      //   path.resolve(
      //     process.cwd(),
      //     "./pacts/matching_service-animal_profile_service.json"
      //   ),
      // ],

      pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
      pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
      publishVerificationResult: true,
      providerVersion: "1.0.0",
    }

    return new VerifierV3(opts).verifyProvider().then(output => {
      console.log("Pact Verification Complete!")
      console.log(output)
    })
  })
})
