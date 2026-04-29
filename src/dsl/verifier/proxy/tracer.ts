import express from 'express';
import { pickBy, identity, reduce, Dictionary } from 'lodash';

import logger from '../../../common/logger';

const removeEmptyResponseProperties = (body: string, res: express.Response) =>
  pickBy(
    {
      body,
      headers: reduce(
        res.getHeaders(),
        (
          acc: Dictionary<string | number | string[] | undefined>,
          val,
          index,
        ) => {
          acc[index] = val;
          return acc;
        },
        {},
      ),
      status: res.statusCode,
    },
    identity,
  );

const removeEmptyRequestProperties = (req: express.Request) =>
  pickBy(
    {
      body: req.body,
      headers: req.headers,
      method: req.method,
      path: req.path,
    },
    identity,
  );

export const createResponseTracer =
  (): express.RequestHandler => (_, res, next) => {
    const oldWrite = res.write.bind(res) as (
      chunk: string | Buffer,
      encodingOrCb?: BufferEncoding | ((error?: Error | null) => void),
      callback?: (error?: Error | null) => void,
    ) => boolean;
    const oldEnd = res.end.bind(res) as (
      chunkOrCb?: string | Buffer | (() => void),
      encodingOrCb?: BufferEncoding | (() => void),
      cb?: () => void,
    ) => express.Response;
    const chunks: Buffer[] = [];

    res.write = ((
      chunk: string | Buffer,
      encodingOrCb?: BufferEncoding | ((error?: Error | null) => void),
      callback?: (error?: Error | null) => void,
    ) => {
      chunks.push(Buffer.from(chunk));
      if (typeof encodingOrCb === 'function') {
        return oldWrite(chunk, encodingOrCb);
      }
      return oldWrite(chunk, encodingOrCb, callback);
    }) as typeof res.write;

    res.end = ((
      chunkOrCb?: string | Buffer | (() => void),
      encodingOrCb?: BufferEncoding | (() => void),
      cb?: () => void,
    ) => {
      const chunk = typeof chunkOrCb === 'function' ? undefined : chunkOrCb;
      if (chunk) {
        chunks.push(Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks).toString('utf8');
      logger.debug(
        `outgoing response: ${JSON.stringify(
          removeEmptyResponseProperties(body, res),
        )}`,
      );
      if (typeof chunkOrCb === 'function') {
        return oldEnd(chunkOrCb);
      }
      if (typeof encodingOrCb === 'function') {
        return oldEnd(chunkOrCb, encodingOrCb);
      }
      return oldEnd(chunkOrCb, encodingOrCb, cb);
    }) as typeof res.end;
    if (typeof next === 'function') {
      next();
    }
  };

export const createRequestTracer =
  (): express.RequestHandler => (req, _, next) => {
    logger.debug(
      `incoming request: ${JSON.stringify(removeEmptyRequestProperties(req))}`,
    );
    next();
  };
