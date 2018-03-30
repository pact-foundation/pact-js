/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import { like, term } from "../../../src/dsl/matchers";
import { dogApiHandler } from "./dog-handler";

const { MessageConsumer, Message } = require("../../../src/pact");
const path = require("path");
const expect = chai.expect;

chai.use(chaiAsPromised);

describe("Message consumer (pact provider) tests", () => {
  const messagePact = new MessageConsumer({
    consumer: "MyJSMessageConsumer",
    dir: path.resolve(process.cwd(), "pacts"),
    pactfileWriteMode: "update",
    provider: "MyJSMessageProvider",
    logLevel: "INFO",
  });

  describe("receive dog event", () => {
    it("should accept a valid dog", () => {
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
        .verify(dogApiHandler);
    });
  });

  // This is an example of a pact breaking
  // uncomment to see how it works!
  it.skip("should not accept an invalid dog", () => {
    const promise = messagePact
      .given("some state")
      .expectsToReceive("a request for a dog")
      .withContent({
        name: "fido",
      })
      .withMetadata({
        "content-type": "application/json",
      })
      .verify(dogApiHandler);

    // tslint:disable: no-unused-expression
    expect(promise).to.eventually.be.rejected;
  });
});
