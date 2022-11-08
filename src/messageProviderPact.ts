/**
 * @module Message
 */

import { omit, isEmpty } from 'lodash';

import serviceFactory, { VerifierOptions } from '@pact-foundation/pact-core';
import express from 'express';
import * as http from 'http';
import bodyParser from 'body-parser';
import { encode as encodeBase64 } from 'js-base64';

import {
  MessageDescriptor,
  MessageFromProviderWithMetadata,
  MessageProvider,
} from './dsl/message';
import logger, { setLogLevel } from './common/logger';
import { PactMessageProviderOptions } from './dsl/options';

// Listens for the server start event
// Converts event Emitter to a Promise
export const waitForServerReady = (server: http.Server): Promise<http.Server> =>
  new Promise((resolve, reject) => {
    server.on('listening', () => resolve(server));
    server.on('error', () => reject());
  });

// Get the Proxy we'll pass to the CLI for verification
export const setupProxyServer = (
  app: (request: http.IncomingMessage, response: http.ServerResponse) => void
): http.Server => http.createServer(app).listen();

const hasMetadata = (
  o: unknown | MessageFromProviderWithMetadata
): o is MessageFromProviderWithMetadata =>
  Boolean((o as MessageFromProviderWithMetadata).__pactMessageMetadata);

export const providerWithMetadata =
  (
    provider: MessageProvider,
    metadata: Record<string, string>
  ): MessageProvider =>
  (descriptor: MessageDescriptor) =>
    Promise.resolve(provider(descriptor)).then((message) =>
      hasMetadata(message)
        ? {
            __pactMessageMetadata: {
              ...message.__pactMessageMetadata,
              ...metadata,
            },
            message,
          }
        : { __pactMessageMetadata: metadata, message }
    );

/**
 * A Message Provider is analagous to Consumer in the HTTP Interaction model.
 *
 * It is the initiator of an interaction, and expects something on the other end
 * of the interaction to respond - just in this case, not immediately.
 */
export class MessageProviderPact {
  constructor(private config: PactMessageProviderOptions) {
    if (config.logLevel && !isEmpty(config.logLevel)) {
      serviceFactory.logLevel(config.logLevel);
      setLogLevel(config.logLevel);
    } else {
      setLogLevel();
    }
  }

  /**
   * Verify a Message Provider.
   */
  public verify(): Promise<unknown> {
    logger.info('Verifying message');

    // Start the verification CLI proxy server
    const app = this.setupProxyApplication();
    const server = setupProxyServer(app);

    // Run the verification once the proxy server is available
    return waitForServerReady(server)
      .then(this.runProviderVerification())
      .then(
        (result) => {
          server.close();
          return result;
        },
        (err) => {
          server.close();
          throw err;
        }
      );
  }

  // Run the Verification CLI process
  private runProviderVerification() {
    return (server: http.Server) => {
      const opts = {
        ...omit(this.config, 'handlers'),
        ...{ providerBaseUrl: `http://localhost:${server.address().port}` },
      } as VerifierOptions;

      return serviceFactory.verifyPacts(opts);
    };
  }

  // Get the API handler for the verification CLI process to invoke on POST /*
  private setupVerificationHandler(): (
    req: express.Request,
    res: express.Response
  ) => void {
    return (req, res) => {
      const message: MessageDescriptor = req.body;

      // Invoke the handler, and return the JSON response body
      // wrapped in a Message
      this.setupStates(message)
        .then(() => this.findHandler(message))
        .then((handler) => handler(message))

        .then((messageFromHandler) => {
          if (hasMetadata(messageFromHandler)) {
            const metadata = encodeBase64(
              JSON.stringify(messageFromHandler.__pactMessageMetadata)
            );
            res.header('Pact-Message-Metadata', metadata);
            res.header('PACT_MESSAGE_METADATA', metadata);

            return res.json(messageFromHandler.message);
          }
          return res.json(messageFromHandler);
        })
        .catch((e) => res.status(500).send(e));
    };
  }

  // Get the Express app that will run on the HTTP Proxy
  private setupProxyApplication(): express.Express {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use((req, res, next) => {
      // TODO: this seems to override the metadata for content-type
      res.header('Content-Type', 'application/json; charset=utf-8');
      next();
    });

    // Proxy server will respond to Verifier process
    app.all('/*', this.setupVerificationHandler());

    return app;
  }

  // Lookup the handler based on the description, or get the default handler
  private setupStates(message: MessageDescriptor): Promise<unknown> {
    const promises: Array<Promise<unknown>> = [];

    if (message.providerStates) {
      message.providerStates.forEach((state) => {
        const handler = this.config.stateHandlers
          ? this.config.stateHandlers[state.name]
          : null;

        if (handler) {
          promises.push(handler(state.name, state.params));
        } else {
          logger.warn(`no state handler found for "${state.name}", ignoring`);
        }
      });
    }

    return Promise.all(promises);
  }

  // Lookup the handler based on the description, or get the default handler
  private findHandler(message: MessageDescriptor): Promise<MessageProvider> {
    const handler = this.config.messageProviders
      ? this.config.messageProviders[message.description || '']
      : undefined;

    if (!handler) {
      logger.error(`no handler found for message ${message.description}`);

      return Promise.reject(
        new Error(
          `No handler found for message "${message.description}".
             Check your "handlers" configuration`
        )
      );
    }

    return Promise.resolve(handler);
  }
}
