const {
  PactV3,
  MatchersV3,
  XmlBuilder,
  VerifierV3,
} = require("@pact-foundation/pact/v3")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const { server } = require("../provider.js")
const path = require("path")

server.listen(8081, () => {
  console.log("SOAP API listening on http://localhost:8081")
})

describe("Pact XML Verification", () => {
  it("validates the expectations of Matching Service", () => {
    const opts = {
      provider: "XML Service",
      providerBaseUrl: "http://localhost:8081",
      pactUrls: ["./pacts/TodoApp-TodoServiceV3.json"],
      // pactUrls: [
      //   path.resolve(
      //     process.cwd(),
      //     "./pacts/matching_service-animal_profile_service.json"
      //   ),
      // ],
      stateHandlers: {
        "i have a list of projects": setup => {},
      },
    }

    return new VerifierV3(opts).verifyProvider().then(output => {
      console.log("Pact Verification Complete!")
      console.log(output)
    })
  })
})
