
/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";

const { MessageProducer, Message } = require("../../../src/pact");
const { config } = require("../../../src/common/config");
const { logger } = require("../../../src/common/logger");
const path = require("path");
const expect = chai.expect;
const { dogApiClient } = require("./dog-client");

chai.use(chaiAsPromised);
config.logging = true;

describe("Message producer (pact Provider) tests", () => {

  const p = new MessageProducer({
    customProviderHeaders: ["Authorization: basic e5e5e5e5e5e5e5"],
    handlers: {
      "a request for a dog": () => dogApiClient.createDog(27),
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
  });

  describe("send a dog event", () => {
    it("should send a valid dog", () => {
      return p.verify();
    });
  });
});
