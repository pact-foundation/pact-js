"use strict";
// Polyfill Object.assign since it's missing in Popsicle
require("es6-object-assign").polyfill();

import * as Popsicle from "popsicle/dist/common";
import {Response} from "popsicle/dist/response";
import {logger} from "./logger";

export enum HTTPMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

export class Request {
  public send(method: HTTPMethod, url: string, body?: string): Promise<string> {
    const opts = {
      body,
      headers: {
        "Content-Type": "application/json",
        "X-Pact-Mock-Service": "true",
      },
      method,
      timeout: 10000,
      transport: Popsicle.createTransport({
        rejectUnauthorized: false, // Need to tell node to ignore bad ssl cert
        type: "text",
      }),
      url,
    };

    logger.info(`Sending request with opts: ${JSON.stringify(opts)}`);

    return Popsicle.request(opts)
      .then((res: Response) => {
        if (res.status >= 200 && res.status < 400) {
          logger.info(`Resolving promise with: ${res.body}`);
          return res.body;
        } else {
          logger.info(`Rejecting promise with: ${res.body}`);
          return Promise.reject(res.body);
        }
      });
  }
}
