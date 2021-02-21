const { MessageProviderPact } = require("@pact-foundation/pact")
const { versionFromGitTag } = require("@pact-foundation/absolute-version")
const path = require("path")
const { createEvent } = require("./index")

describe("Message provider tests", () => {
  const p = new MessageProviderPact({
    messageProviders: {
      "a request to save an event": () => createEvent(),
    },
    logLevel: "WARN",
    provider: "SNSPactEventProvider",

    // Your version numbers need to be unique for every different version of your provider
    // see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
    // If you use git tags, then you can use @pact-foundation/absolute-version as we do here.
    providerVersion: versionFromGitTag(),

    // For local validation
    // pactUrls: [path.resolve(process.cwd(), "pacts", "snspacteventconsumer-snspacteventprovider.json")],

    // Uncomment to use the broker
    pactBrokerUrl: "https://test.pact.dius.com.au/",
    pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
    pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
    publishVerificationResult: true,

    consumerVersionTags: ["latest"],
  })

  describe("send an event", () => {
    it("sends a valid event", () => {
      return p.verify()
    })
  })
})
