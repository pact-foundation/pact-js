import http, { RequestOptions, ClientRequest, IncomingMessage } from 'http';

import logger from '../common/logger';

export const traceHttpInteractions = (): void => {
  const originalRequest = http.request;

  http.request = (
    options: RequestOptions,
    cb: (res: IncomingMessage) => void
  ): ClientRequest => {
    const requestBodyChunks: Buffer[] = [];
    const responseBodyChunks: Buffer[] = [];

    const hijackedCalback = (res: IncomingMessage) => {
      logger.trace(
        `outgoing request: ${JSON.stringify({
          ...options,
          body: Buffer.concat(requestBodyChunks).toString('utf8'),
        })}`
      );

      if (cb) {
        cb(res);
      }
    };

    const clientRequest: ClientRequest = originalRequest(
      options,
      hijackedCalback
    );
    const oldWrite = clientRequest.write.bind(clientRequest);

    clientRequest.write = (
      chunk: Parameters<typeof clientRequest.write>[0]
    ) => {
      requestBodyChunks.push(Buffer.from(chunk));
      return oldWrite(chunk);
    };

    clientRequest.on('response', (incoming: IncomingMessage) => {
      incoming.on('readable', () => {
        responseBodyChunks.push(Buffer.from(incoming.read()));
      });
      incoming.on('end', () => {
        logger.trace(
          `response: ${JSON.stringify({
            body: Buffer.concat(responseBodyChunks).toString('utf8'),
            headers: incoming.headers,
            statusCode: incoming.statusCode,
          })}`
        );
      });
    });

    return clientRequest;
  };
};
