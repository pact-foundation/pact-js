import logger from '../../../common/logger';
import {
  MessageDescriptor,
  MessageFromProviderWithMetadata,
  MessageProvider,
} from '../../message';
import express from 'express';
import bodyParser from 'body-parser';
import { encode as encodeBase64 } from 'js-base64';
import { ProxyOptions } from './types';

// Find a provider message handler, and invoke it
export const findMessageHandler = (
  message: MessageDescriptor,
  config: ProxyOptions
): Promise<MessageProvider> => {
  const handler = config.messageProviders
    ? config.messageProviders[message.description]
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
};

// Get the Express app that will run on the HTTP Proxy
export const setupMessageProxyApplication = (
  config: ProxyOptions
): express.Express => {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use((_, res, next) => {
    // TODO: this seems to override the metadata for content-type
    res.header('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // Proxy server will respond to Verifier process
  app.all('/*', createProxyMessageHandler(config));

  return app;
};

// Get the API handler for the verification CLI process to invoke on POST /*
export const createProxyMessageHandler = (
  config: ProxyOptions
): ((req: express.Request, res: express.Response) => void) => {
  return (req, res) => {
    const message: MessageDescriptor = req.body;

    // Invoke the handler, and return the JSON response body
    // wrapped in a Message
    findMessageHandler(message, config)
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
};

// // Get the Proxy we'll pass to the CLI for verification
// export const setupProxyServer = (
//   app: (request: http.IncomingMessage, response: http.ServerResponse) => void
// ): http.Server => http.createServer(app).listen();

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
