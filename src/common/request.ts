'use strict'

import { parse } from 'url';
import { logger } from './logger';

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export class Request {
  // Can't type these otherwise will break at runtime
  // (browser can't import request types!)
  // These probably needs a good refactor.
  public _httpRequest: any;
  public _httpsRequest: any;
  public _request: any;

  constructor() {
    console.log('constructing', window)
    if (typeof window === 'undefined') {
      logger.info('Using Node "HTTP" module')
      console.log('constructing1')
      this._httpRequest = require('http');
      this._httpsRequest = require('https');
    } else if ((<any>window).XMLHttpRequest) {
      console.log('constructing2')
      logger.info('Using browser "XMLHttpRequest" module')
      this._request = new XMLHttpRequest();
    } else {
      console.log('constructing3')
      logger.info('Unable to determine runtime environment');
    }
  }

  send(method: HTTPMethod, url: string, body?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        const opts: any = parse(url)
        opts.method = method;
        opts.headers = {
          'X-Pact-Mock-Service': 'true',
          'Content-Type': 'application/json'
        };

        logger.info(`Sending request with opts: ${JSON.stringify(opts)}`);

        const req = opts.protocol === 'https:' ? this._httpsRequest : this._httpRequest;
        const request = req.request(opts, (response: any) => {
          let responseBody = '';
          response.setEncoding('utf8');
          response.on('data', (data: string) => { responseBody += data });
          response.on('end', () => {
            if (response.statusCode >= 200 && response.statusCode < 400) {
              logger.info(`Resolving promise with: ${responseBody}`);
              resolve(responseBody);
            } else {
              logger.info(`Rejecting promise with: ${responseBody}`);
              reject(responseBody);
            }
          })
        })

        request.on('error', (err: any) => {
          logger.info(`Rejecting promise with: ${err}`);
          reject(err);
        })

        if (body) {
          request.write(body);
        }

        request.end();
      } else {
        const req = this._request;
        req.onload = () => {
          if (req.status >= 200 && req.status < 400) {
            logger.info(`Resolving promise with: ${req.responseText}`);
            resolve(req.responseText);
          } else {
            logger.info(`Rejecting promise with: ${req.responseText}`);
            reject(req.responseText);
          }
        }

        req.onerror = (err: any) => {
          logger.info(`Rejecting promise with: ${err}`);
          reject(err);
        }

        req.open(method, url, true);
        req.setRequestHeader('X-Pact-Mock-Service', 'true');
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(body);
      }
    })
  }
}
