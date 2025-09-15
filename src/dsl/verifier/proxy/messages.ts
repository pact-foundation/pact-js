import express from 'express';
import bodyParser from 'body-parser';
import { encode as encodeBase64 } from 'js-base64';
import {
  MessageDescriptor,
  MessageFromProviderWithMetadata,
  MessageProvider,
} from '../../message';
import logger from '../../../common/logger';
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

// Get the API handler for the verification CLI process to invoke on POST /*
export const createProxyMessageHandler =
  (
    config: ProxyOptions
  ): ((req: express.Request, res: express.Response) => void) =>
  (req, res) => {
    // req.body = {
    //   description: 'a MATT message',
    //   providerStates: [ { name: 'a Matt message is sent' } ],
    //   request: {
    //     contents: {
    //       content: 'aGVsbG90Y3A=',
    //       contentType: 'application/matt',
    //       encoded: 'base64'
    //     },
    //     matchingRules: {
    //       body: {
    //         '$': {
    //           combine: 'AND',
    //           matchers: [ { match: 'contentType', value: 'application/matt' } ]
    //         }
    //       }
    //     },
    //     metadata: { contentType: 'application/matt' }
    //   }
    // }
    // {
    //   description: 'a MATT message',
    //   providerStates: [ { name: 'a Matt message is sent with JSON content' } ],
    //   request: {
    //     contents: {
    //       content: { message: 'hellotcp' },
    //       contentType: 'application/json',
    //       encoded: false
    //     },
    //     metadata: { contentType: 'application/json' }
    //   }
    // }
    const message: MessageDescriptor = req.body;
    message.metadata = req.body.request?.metadata;

    // Add the request body, if one exists for synchronous messages
    if (req.body.request?.contents) {
      const encodedMessage = req.body.request?.contents?.encoded || false;
      if (encodedMessage) {
        message.content = Buffer.from(
          req.body.request?.contents?.content as string,
          'base64'
        );
      } else {
        message.content = req.body.request?.contents?.content;
      }
    }

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

          // Ensure return content-type is set here
          // TODO: this needs thinking through
          if (
            messageFromHandler.__pactMessageMetadata['content-type'] ||
            messageFromHandler.__pactMessageMetadata['Content-Type'] ||
            messageFromHandler.__pactMessageMetadata.contentType
          ) {
            res.type(
              messageFromHandler.__pactMessageMetadata['content-type'] ||
                messageFromHandler.__pactMessageMetadata['Content-Type'] ||
                messageFromHandler.__pactMessageMetadata.contentType
            );

            return res.send(messageFromHandler.message);
          }

          return res.json(messageFromHandler.message);
        }
        return res.json(messageFromHandler);
      })
      .catch((e) => res.status(500).send(e));
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
  app.all('/{splat}', createProxyMessageHandler(config));

  return app;
};

// // Get the Proxy we'll pass to the CLI for verification
// export const setupProxyServer = (
//   app: (request: http.IncomingMessage, response: http.ServerResponse) => void
// ): http.Server => http.createServer(app).listen();
