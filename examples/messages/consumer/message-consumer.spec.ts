/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */

import { like, term } from "../../../src/dsl/matchers"
import { dogApiHandler } from "./dog-handler"

const {
  MessageConsumerPact,
  synchronousBodyHandler,
} = require("../../../src/pact")
const path = require("path")

describe("Message consumer tests", () => {
  const messagePact = new MessageConsumerPact({
    consumer: "MyJSMessageConsumer",
    dir: path.resolve(process.cwd(), "pacts"),
    pactfileWriteMode: "update",
    provider: "MyJSMessageProvider",
    logLevel: "INFO",
  })

  describe("receive dog event", () => {
    it("accepts a valid dog", () => {
      return messagePact
        .given("some state")
        .expectsToReceive("a request for a dog")
        .withContent({
          id: like(1),
          name: like("rover"),
          type: term({ generate: "bulldog", matcher: "^(bulldog|sheepdog)$" }),
        })
        .withMetadata({
          "content-type": "application/json",
        })
        .verify(synchronousBodyHandler(dogApiHandler))
    })
  })

  // This is an example of a pact breaking
  // uncomment to see how it works!
  it.skip("Does not accept an invalid dog", () => {
    return messagePact
      .given("some state")
      .expectsToReceive("a request for a dog")
      .withContent({
        name: "fido",
      })
      .withMetadata({
        "content-type": "application/json",
      })
      .verify(dogApiHandler)
  })
})
