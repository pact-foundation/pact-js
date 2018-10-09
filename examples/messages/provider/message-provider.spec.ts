/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
const { MessageProviderPact } = require("../../../src/pact")
import path = require("path")
const { createDog } = require("./dog-client")

describe("Message provider tests", () => {
  const p = new MessageProviderPact({
    messageProviders: {
      "a request for a dog": () => createDog(27),
    },
    log: path.resolve(process.cwd(), "logs"),
    logLevel: "INFO",
    provider: "MyJSMessageProvider",
    providerVersion: "1.0.0",

    // For local validation
    // pactUrls: [path.resolve(process.cwd(), "pacts", "myjsmessageconsumer-myjsmessageprovider.json")],
    // Broker validation
    pactBrokerUrl: "https://test.pact.dius.com.au/",
    pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
    pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
    publishVerificationResult: true,
    tags: ["prod"],
  })

  describe("send a dog event", () => {
    it("should send a valid dog", () => {
      return p.verify()
    })
  })
})
