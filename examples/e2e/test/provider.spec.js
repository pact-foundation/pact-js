const { Verifier } = require("../../../dist/pact")
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
  it("should validate the expectations of Matching Service", () => {
    let token = "INVALID TOKEN"

    let opts = {
      provider: "Animal Profile Service",

      // TODO: Rather than provide a running endpoint, could we simply pass in
      //       an "application" to invoke, rather than fully HTTP start/stop context?
      // Maybe, albeit we probably would both
      // a) need to be backwards compatible (i.e. still enable this mode), or
      // b) need to support the most widely used/adopted interface (pressumably the in-built http module)
      providerBaseUrl: "http://localhost:8081",

      // TODO: Deprecate, but allow backwards compatibility
      // providerStatesSetupUrl: 'http://localhost:8081/setup',

      // Optional middleware
      // TODO:  Use standard Express middleware style here?
      //        What if "pact" context (e.g. provider state required/wanted here)
      // TODO2: Wrap the middleware in Pact context (e.g. state/description/pact available also)
      // TODO: docs on what can/can't/should/shouldn't be done here (test parsing body to see if it interferes with proxy)
      requestFilter: (req, res, next) => {
        console.log(
          "Middleware invoked before provider API - chance to modify request"
        )
        req.headers["MY_SPECIAL_HEADER"] = "my special value"

        // e.g. ADD Bearer token
        req.headers["Authorization"] = `Bearer: ${token}`
        next()
      },

      // TODO: could we use decorators as an alternative to this?
      //       Decorator could register the function as a state handler
      //       to the framework
      stateHandlers: {
        "Has no animals": state => {
          animalRepository.clear()
          return Promise.resolve(`${state}: Animals added to the db`)
        },
        "Has some animals": state => {
          importData()
          return Promise.resolve(`${state}: Animals added to the db`)
        },
        "Has an animal with ID 1": state => {
          importData()
          return Promise.resolve(`${state}: Animals added to the db`)
        },
        "is authenticated": state => {
          token = "generate a valid token for this state"
          Promise.resolve(`Valid bearer token generated`)
        },
      },
      // Fetch pacts from broker
      // pactBrokerUrl: 'https://test.pact.dius.com.au/',
      // Fetch from broker with given tags
      // tags: ['prod', 'sit5'],
      // Specific Remote pacts (doesn't need to be a broker)
      // pactFilesOrDirs: ['https://test.pact.dius.com.au/pacts/provider/Animal%20Profile%20Service/consumer/Matching%20Service/latest'],
      // Local pacts
      pactUrls: [
        path.resolve(
          process.cwd(),
          "./pacts/matching_service-animal_profile_service.json"
        ),
      ],
      // pactBrokerUsername: 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M',
      // pactBrokerPassword: 'O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1',
      // publishVerificationResult: true,
      providerVersion: "1.0.0",

      // TODO: deprecate this in favour of requestFilter
      // customProviderHeaders: ['Authorization: basic e5e5e5e5e5e5e5']
    }

    return new Verifier().verifyProvider().then(output => {
      console.log("Pact Verification Complete!")
      console.log(output)
    })
  })
})
