import type * as http from 'node:http';
import querystring from 'node:querystring';
import { cloneDeep, isEqual } from 'lodash';

interface ReqBodyExtended extends http.IncomingMessage {
  body?: Buffer | string | Record<string, unknown>;
}

interface UrlEncodedBodyRecord {
  rawBody: Buffer;
  parsedBody?: unknown;
}

const urlEncodedBodies = new WeakMap<
  http.IncomingMessage,
  UrlEncodedBodyRecord
>();

export const recordUrlEncodedRawBody = (
  req: http.IncomingMessage,
  rawBody: Buffer,
): void => {
  urlEncodedBodies.set(req, { rawBody: Buffer.from(rawBody) });
};

export const snapshotParsedUrlEncodedBody = (
  req: http.IncomingMessage,
): void => {
  const entry = urlEncodedBodies.get(req);
  const body = (req as ReqBodyExtended).body;
  if (entry && body && typeof body === 'object') {
    entry.parsedBody = cloneDeep(body);
  }
};

const isUrlEncodedContentType = (
  contentType: string | string[] | undefined,
): boolean => {
  const value = Array.isArray(contentType) ? contentType[0] : contentType;
  if (!value) {
    return false;
  }

  return (
    value.split(';')[0].trim().toLowerCase() ===
    'application/x-www-form-urlencoded'
  );
};

const serializeUrlEncoded = (obj: Record<string, unknown>): string => {
  const flat: Record<string, string | string[]> = {};

  const collect = (prefix: string, value: unknown): void => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      if (value.every((v) => v === null || typeof v !== 'object')) {
        flat[prefix] = value
          .filter((v) => v !== undefined && v !== null)
          .map(String);
        return;
      }

      value.forEach((v, i) => {
        collect(`${prefix}[${i}]`, v);
      });
      return;
    }

    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        collect(prefix ? `${prefix}[${k}]` : k, v);
      }
      return;
    }

    flat[prefix] = String(value);
  };

  collect('', obj);
  return querystring.stringify(flat);
};

export const parseBody = (req: ReqBodyExtended): Buffer => {
  let bodyData = Buffer.alloc(0);

  if (!req.body) {
    return bodyData;
  }

  if (Buffer.isBuffer(req.body)) {
    bodyData = Buffer.from(req.body);
  } else if (typeof req.body === 'string') {
    // A requestFilter may replace the body with a pre-serialised string
    // (e.g. a re-signed form or JSON payload). Forward it verbatim.
    bodyData = Buffer.from(req.body, 'utf8');
  } else if (typeof req.body === 'object') {
    if (isUrlEncodedContentType(req.headers?.['content-type'])) {
      const recorded = urlEncodedBodies.get(req);
      if (
        recorded &&
        (recorded.parsedBody === undefined ||
          isEqual(req.body, recorded.parsedBody))
      ) {
        bodyData = Buffer.from(recorded.rawBody);
      } else {
        bodyData = Buffer.from(serializeUrlEncoded(req.body));
      }
    } else {
      bodyData = Buffer.from(JSON.stringify(req.body));
    }
  }

  return bodyData;
};
