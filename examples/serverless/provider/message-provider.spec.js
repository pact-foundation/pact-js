/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
const {
  MessageProviderPact,
  Message,
  Matchers,
} = require("@pact-foundation/pact")
const path = require("path")
const { like, term } = Matchers
const { createEvent } = require("./index")

describe("Message provider tests", () => {
  const p = new MessageProviderPact({
    messageProviders: {
      "a request to save an event": () => createEvent(),
    },
    logLevel: "WARN",
    provider: "SNSPactEventProvider",
    providerVersion: "1.0.0",

    // For local validation
    // pactUrls: [path.resolve(process.cwd(), "pacts", "snspacteventconsumer-snspacteventprovider.json")],

    // Uncomment to use the broker
    pactBrokerUrl: "https://test.pact.dius.com.au/",
    pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
    pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
    publishVerificationResult: true,

    // Tag the contract
    tags: ["latest"],
  })

  describe("send an event", () => {
    it("sends a valid event", () => {
      return p.verify()
    })
  })
})
