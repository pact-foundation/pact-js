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
          index
        ) => {
          acc[index] = val;
          return acc;
        },
        {}
      ),
      status: res.statusCode,
    },
    identity
  );

const removeEmptyRequestProperties = (req: express.Request) =>
  pickBy(
    {
      body: req.body,
      headers: req.headers,
      method: req.method,
      path: req.path,
    },
    identity
  );

export const createResponseTracer =
  (): express.RequestHandler => (_, res, next) => {
    const [oldWrite, oldEnd] = [res.write, res.end];
    const chunks: Buffer[] = [];

    res.write = (chunk: Parameters<typeof res.write>[0]) => {
      chunks.push(Buffer.from(chunk));
      return oldWrite.apply(res, [chunk]);
    };

    // I think the type definitions in @types/node is wrong/broken.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    res.end = (chunk: Parameters<typeof res.write>[0]) => {
      if (chunk) {
        chunks.push(Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks).toString('utf8');
      logger.debug(
        `outgoing response: ${JSON.stringify(
          removeEmptyResponseProperties(body, res)
        )}`
      );
      oldEnd.apply(res, [chunk]);
    };
    if (typeof next === 'function') {
      next();
    }
  };

export const createRequestTracer =
  (): express.RequestHandler => (req, _, next) => {
    logger.debug(
      `incoming request: ${JSON.stringify(removeEmptyRequestProperties(req))}`
    );
    next();
  };
