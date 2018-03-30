/**
 * A Message is an asynchronous Interaction, sent via a Producer
 * (consumer in the http, synchronous interaction parlance)
 * @module Message
 */

import { isNil, omit } from "lodash";
import { MatcherResult } from "./dsl/matchers";
import { Verifier } from "./dsl/verifier";
import { qToPromise } from "./common/utils";
import { Metadata, Message } from "./dsl/message";
import { logger } from "./common/logger";
import serviceFactory, { VerifierOptions } from "@pact-foundation/pact-node";
import { MessageProducerOptions } from "./dsl/options";
import * as express from "express";
import * as http from "http";
import { Promise } from "es6-promise";

// Setup Handler API
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

export class MessageProducer {
  private state: any = {};

  constructor(private config: MessageProducerOptions) {
    serviceFactory.logLevel(this.config.logLevel);
  }

  // verify
  public verify(): Promise<any> {
    return new Promise((resolve, reject) => {
      logger.info("Verifying message");
      const server = http.createServer(app).listen();

      app.all("/*", (req, res) => {

        // Extract the message request from the API
        const message: Message = req.body;

        // Lookup the handler based on the description, or get the default handler
        const handler = this.config.handlers[message.description || ""];

        if (!handler) {
          logger.warn(`no handler found for message ${message.description}`);
          res.sendStatus(404);
          return;
        }

        // Invoke the handler, and return the JSON response body
        // wrapped in a Message
        handler()
          .then(this.transformResponse)
          .then((o) => res.json(o))
          .catch(() => res.sendStatus(500));
      });

      server.on("listening", () => {
        const opts = {
          ...(omit(this.config, "handlers")),
          ...{ providerBaseUrl: "http://localhost:" + server.address().port },
        } as VerifierOptions;

        console.log(opts);

        // Run verification
        new Verifier()
          .verifyProvider(opts)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  protected transformResponse(obj: any): Promise<Message> {
    return Promise.resolve({ content: obj });
  }
}
