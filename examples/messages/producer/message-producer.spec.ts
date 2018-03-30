
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
    consumer: "myconsumer",
    handlers: {
      "a dog": () => {
        return new Promise((resolve, reject) => {
          const dog = {
            id: 1,
            name: "billy",
            type: "not a thig",
          };
          logger.info("Returning dog:");
          logger.info(dog);
          resolve(dog);
        });
      },
    },
    log: path.resolve(process.cwd(), "logs"),
    logLevel: "DEBUG",
    pactUrls: [path.resolve(process.cwd(), "pacts", "myconsumer-myprovider.json")],
    provider: "myprovider",
    providerVersion: "1.0.0",
  });

  describe("send a dog event", () => {
    it("should send a valid dog", () => {
      return p.verify();
    });
  });
});
