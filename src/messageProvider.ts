/**
 * @module Message
 */

import { omit, isEmpty } from "lodash";
import { Verifier } from "./dsl/verifier";
import { Message } from "./dsl/message";
import { logger } from "./common/logger";
import { VerifierOptions } from "@pact-foundation/pact-node";
import { MessageProviderOptions } from "./dsl/options";
import serviceFactory from "@pact-foundation/pact-node";
import * as express from "express";
import * as http from "http";
import { Promise } from "es6-promise";
import { Handler } from "./pact";

const bodyParser = require("body-parser");

/**
 * A Message Provider is analagous to Consumer in the HTTP Interaction model.
 *
 * It is the initiator of an interaction, and expects something on the other end
 * of the interaction to respond - just in this case, not immediately.
 */
export class MessageProvider {
  private state: any = {};

  constructor(private config: MessageProviderOptions) {
    if (!isEmpty(config.logLevel)) {
      serviceFactory.logLevel(config.logLevel);
    }
  }

  /**
   * Verify a Message Provider.
   */
  public verify(): Promise<any> {
    logger.info("Verifying message");

    // Start the verification CLI proxy server
    const app = this.setupProxyApplication();
    const server = this.setupProxyServer(app);

    // Run the verification once the proxy server is available
    return this
      .waitForServerReady(server)
      .then(this.runProviderVerification());
  }

  // Listens for the server start event
  // Converts event Emitter to a Promise
  private waitForServerReady(server: http.Server): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      server.on("listening", () => resolve(server));
      server.on("error", () => reject());
    });
  }

  // Run the Verification CLI process
  private runProviderVerification() {
    return (server: http.Server) => {
      const opts = {
        ...(omit(this.config, "handlers")),
        ...{ providerBaseUrl: "http://localhost:" + server.address().port },
      } as VerifierOptions;

      // Run verification
      return new Verifier().verifyProvider(opts);
    };
  }

  // Get the API handler for the verification CLI process to invoke on POST /*
  private setupVerificationHandler(): (req: express.Request, res: express.Response) => void {
    return (req, res) => {
      // Extract the message request from the API
      const message: Message = req.body;

      // Invoke the handler, and return the JSON response body
      // wrapped in a Message
      this
        .findHandler(message)
        .then((handler) => handler(message))
        .then((o) => res.json({ content: o }))
        .catch((e) => res.status(500).send(e));
    };
  }

  // Get the Proxy we'll pass to the CLI for verification
  private setupProxyServer(app: (request: http.IncomingMessage, response: http.ServerResponse) => void): http.Server {
    return http.createServer(app).listen();
  }

  // Get the Express app that will run on the HTTP Proxy
  private setupProxyApplication(): express.Express {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true,
    }));
    app.use((req, res, next) => {
      res.header("Content-Type", "application/json; charset=utf-8");
      next();
    });

    // Proxy server will respond to Verifier process
    app.all("/*", this.setupVerificationHandler());

    return app;
  }

  // Lookup the handler based on the description, or get the default handler
  private findHandler(message: Message): Promise<Handler> {
    const handler = this.config.handlers[message.description || ""];

    if (!handler) {
      logger.warn(`no handler found for message ${message.description}`);

      return Promise.reject(`No handler found for message "${message.description}".` +
        ` Check your "handlers" configuration`);
    }

    return Promise.resolve(handler);
  }
}
