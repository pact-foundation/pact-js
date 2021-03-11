import { Verifier } from "@pact-foundation/pact"
import { versionFromGitTag } from "@pact-foundation/absolute-version"
import app from "./provider"

let server: any

// Verify that the provider meets all consumer expectations
describe("Pact Verification", () => {
  before(done => {
    server = app.listen(4000, () => {
      done()
    })
  })

  it("validates the expectations of Matching Service", () => {
    // lexical binding required here
    const opts = {
      // Local pacts
      // pactUrls: [path.resolve(process.cwd(), "./pacts/graphqlconsumer-graphqlprovider.json")],
      pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
      pactBrokerUrl: "https://test.pact.dius.com.au/",
      pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
      provider: "GraphQLProvider",
      providerBaseUrl: "http://localhost:4000/graphql",
      // Your version numbers need to be unique for every different version of your provider
      // see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
      // If you use git tags, then you can use @pact-foundation/absolute-version as we do here.
      providerVersion: versionFromGitTag(),
      publishVerificationResult: true,
      consumerVersionTags: ["prod"],
    }

    return new Verifier(opts).verifyProvider().then(output => {
      server.close()
    })
  })
})
