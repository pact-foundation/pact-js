"use strict";

import { parse, Url } from "url";
import { logger } from "./logger";

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export class Request {
  // Can't type these otherwise will break at runtime
  // (browser can't import request types!)
  // These probably needs a good refactor.
  public httpRequest: any;
  public httpsRequest: any;
  public request: any;
  public responseBody = "";

  constructor() {
    if (typeof XMLHttpRequest === "function" || typeof window !== "undefined") {
      logger.info('Using browser "XMLHttpRequest" module');
      this.request = new XMLHttpRequest();
    } else if (typeof window === "undefined") {
      logger.info('Using Node "HTTP" module');
      this.httpRequest = require("http");
      this.httpsRequest = require("https");
    } else {
      logger.info("Unable to determine runtime environment");
    }
  }

  public send(method: HTTPMethod, url: string, body?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        const opts: any = parse(url);
        opts.method = method;
        opts.headers = {
          "Content-Type": "application/json",
          "X-Pact-Mock-Service": "true",
        };

        logger.info(`Sending request with opts: ${JSON.stringify(opts)}`);

        const req: any = opts.protocol === "https:" ? this.httpsRequest : this.httpRequest;
        const request = req.request(opts, (response: any) => {
          response.setEncoding("utf8");
          response.on("data", (data: string) => { this.responseBody += data; });
          response.on("end", () => {
            if (response.statusCode >= 200 && response.statusCode < 400) {
              logger.info(`Resolving promise with: ${this.responseBody}`);
              resolve(this.responseBody);
            } else {
              logger.info(`Rejecting promise with: ${this.responseBody}`);
              reject(this.responseBody);
            }
          });
        });

        request.on("error", (err: any) => {
          logger.info(`Rejecting promise with: ${err}`);
          reject(err);
        });

        if (body) {
          request.write(body);
        }

        request.end();
      } else {
        const req = this.request;
        req.onload = () => {
          if (req.status >= 200 && req.status < 400) {
            logger.info(`Resolving promise with: ${req.responseText}`);
            resolve(req.responseText);
          } else {
            logger.info(`Rejecting promise with: ${req.responseText}`);
            reject(req.responseText);
          }
        };

        req.onerror = (err: any) => {
          logger.info(`Rejecting promise with: ${err}`);
          reject(err);
        };

        req.open(method, url, true);
        req.setRequestHeader("X-Pact-Mock-Service", "true");
        req.setRequestHeader("Content-Type", "application/json");
        req.send(body);
      }
    });
  }
}
