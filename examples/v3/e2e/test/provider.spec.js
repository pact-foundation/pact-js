const { VerifierV3 } = require("@pact-foundation/pact/v3")
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

    return new VerifierV3({
      provider: "Animal Profile Service V3",
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
        "Has no animals": setup => {
          if (setup) {
            animalRepository.clear()
            return Promise.resolve({ description: `Animals removed to the db` })
          }
        },
        "Has some animals": setup => {
          if (setup) {
            importData()
            return Promise.resolve({
              description: `Animals added to the db`,
              count: animalRepository.count(),
            })
          }
        },
        "Has an animal with ID": (setup, parameters) => {
          if (setup) {
            importData()
            animalRepository.first().id = parameters.id
            return Promise.resolve({
              description: `Animal with ID ${parameters.id} added to the db`,
              id: parameters.id,
            })
          }
        },
        "is not authenticated": () => {
          token = ""
          return Promise.resolve({
            description: `Invalid bearer token generated`,
          })
        },
        "is authenticated": () => {
          token = "1234"
          return Promise.resolve({ description: `Bearer token generated` })
        },
      },

      // Fetch pacts from broker
      pactBrokerUrl: process.env.CI
        ? "http://localhost:9292"
        : "https://test.pact.dius.com.au",

      // Fetch from broker with given tags
      consumerVersionTags: ["prod"],
      providerVersionTags: ["master"],
      enablePending: true,

      // Specific Remote pacts (doesn't need to be a broker)
      // pactUrls: ['https://test.pact.dius.com.au/pacts/provider/Animal%20Profile%20Service/consumer/Matching%20Service/latest'],
      // Local pacts
      // pactUrls: [
      //   path.resolve(
      //     process.cwd(),
      //     "./pacts/Matching Service V3-Animal Profile Service V3.json"
      //   ),
      // ],

      pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
      pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
      publishVerificationResult: true,
      providerVersion: "1.0.0",
    })
      .verifyProvider()
      .then(output => {
        console.log("Pact Verification Complete!")
        console.log("Result:", output)
      })
  })
})
