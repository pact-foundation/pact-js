import axios from 'axios';
import https from 'https';
import { pathOr } from 'ramda';
import logger from './logger';

// eslint-disable-next-line no-shadow
export enum HTTPMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  COPY = 'COPY',
  LOCK = 'LOCK',
  MKCOL = 'MKCOL',
  MOVE = 'MOVE',
  PROPFIND = 'PROPFIND',
  PROPPATCH = 'PROPPATCH',
  UNLOCK = 'UNLOCK',
  REPORT = 'REPORT',
}

export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'COPY'
  | 'LOCK'
  | 'MKCOL'
  | 'MOVE'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'UNLOCK'
  | 'REPORT';

export class Request {
  public async send(
    method: HTTPMethod,
    url: string,
    body?: string
  ): Promise<string> {
    try {
      const res = await axios(url, {
        data: body,
        headers: {
          'Content-Type': 'application/json',
          'X-Pact-Mock-Service': 'true',
        },
        httpsAgent: new https.Agent({
          keepAlive: true,
          rejectUnauthorized: false,
        }),
        method,
        timeout: 10000,
        url,
        maxBodyLength: Infinity,
      });

      if (res.status >= 200 && res.status < 400) {
        return res.data;
      }
      return await Promise.reject(res.data);
    } catch (e) {
      logger.error(`error making http request: ${e.message}`);
      return Promise.reject(pathOr(e.message, ['response', 'data'], e));
    }
  }
}
