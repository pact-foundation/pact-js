/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import path = require("path")
import * as sinonChai from "sinon-chai"
import { PactV3, MatchersV3 } from "@pact-foundation/pact/v3"
const { eachLike } = MatchersV3

const expect = chai.expect
import { DogService } from "../index"

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe("The Dog API", () => {
  let dogService: DogService

  const provider = new PactV3({
    dir: path.resolve(process.cwd(), "pacts"),
    consumer: "MyConsumer",
    provider: "MyProvider",
  })

  const dogExample = { dog: 1 }
  const EXPECTED_BODY = eachLike(dogExample)

  describe("get /dogs using builder pattern", () => {
    it("returns the correct response", () => {
      provider
        .given("I have a list of dogs")
        .uponReceiving("a request for all dogs with the builder pattern")
        .withRequest({
          path: "/dogs",
          query: { from: "today" },
          headers: { Accept: "application/json" },
        })
        .willRespondWith({
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: EXPECTED_BODY,
        })

      return provider.executeTest(mockserver => {
        dogService = new DogService(mockserver.url)
        return dogService.getMeDogs("today").then(response => {
          return expect(response.data[0]).to.deep.eq(dogExample)
        })
      })
    })
  })
})
