"use strict";
// Polyfill Object.assign since it's missing in Popsicle
require("es6-object-assign").polyfill();

import * as Popsicle from "popsicle/dist/common";
import { Response } from "popsicle/dist/response";

export enum HTTPMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

export type methods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export class Request {
  private readonly transport = Popsicle.createTransport({
    rejectUnauthorized: false, // Need to tell node to ignore bad ssl cert
    type: "text",
  });
  public send(method: HTTPMethod | methods, url: string, body?: string): Promise<string> {
    const opts = {
      body,
      headers: {
        "Content-Type": "application/json",
        "X-Pact-Mock-Service": "true",
      },
      method,
      timeout: 10000,
      transport: this.transport,
      url,
    };

    return Popsicle.request(opts)
      .then((res: Response) => {
        if (res.status >= 200 && res.status < 400) {
          return res.body;
        } else {
          return Promise.reject(res.body);
        }
      });
  }
}
