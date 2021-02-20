/*  tslint:disable: no-console*/
import { MessageProviderPact } from "@pact-foundation/pact"
import { versionFromGitTag } from "@pact-foundation/absolute-version"
import path = require("path")
const { createDog } = require("./dog-client")

describe("Message provider tests", () => {
  const p = new MessageProviderPact({
    messageProviders: {
      "a request for a dog": () => createDog(27),
    },
    stateHandlers: {
      "some state": () => {
        // TODO: prepare system useful in order to create a dog
        console.log('State handler: setting up "some state" for interaction')
        return Promise.resolve(`state set to create a dog`)
      },
    },
    logLevel: "info",
    provider: "MyJSMessageProvider",
    // Your version numbers need to be unique for every different version of your provider
    // see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
    // If you use git tags, then you can use @pact-foundation/absolute-version as we do here.
    providerVersion: versionFromGitTag(),
    // For local validation
    // pactUrls: [path.resolve(process.cwd(), "pacts", "myjsmessageconsumer-myjsmessageprovider.json")],
    // Broker validation
    pactBrokerUrl: "https://test.pact.dius.com.au/",
    pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
    pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
    publishVerificationResult: true,
    consumerVersionTags: ["prod"],
  })

  describe("send a dog event", () => {
    it("sends a valid dog", () => {
      return p.verify()
    })
  })
})
