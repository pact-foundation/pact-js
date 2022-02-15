/* eslint-disable import/first */
import { join, toPairs, map, flatten, forEachObjIndexed } from 'ramda';
import { makeConsumerPact } from '@pact-foundation/pact-core';
import {
  ConsumerPact,
  ConsumerInteraction,
  Mismatch,
  MatchingResult,
  RequestMismatch,
  MatchingResultRequestNotFound,
  MatchingResultMissingRequest,
} from '@pact-foundation/pact-core/src/consumer/index';
import { isArray } from 'util';
import fs = require('fs');
import * as MatchersV3 from './matchers';
import logger from '../common/logger';
import { version as pactPackageVersion } from '../../package.json';
import { JsonMap } from '../common/jsonTypes';

export enum SpecificationVersion {
  SPECIFICATION_VERSION_V2 = 3,
  SPECIFICATION_VERSION_V3 = 4,
}

/**
 * Options for the mock server
 */
export interface PactV3Options {
  /**
   * Directory to write the pact file to
   */
  dir: string;
  /**
   * Consumer name
   */
  consumer: string;
  /**
   * Provider name
   */
  provider: string;
  /**
   * If the mock server should handle CORS pre-flight requests. Defaults to false
   */
  cors?: boolean;
  /**
   * Port to run the mock server on. Defaults to a random port
   */
  port?: number;
  /**
   * Specification version to use
   */
  spec?: SpecificationVersion;
  /**
   * Specification version to use
   */
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error';
}

// const logInvalidOperation = (op: string) => {
//   throw new Error(
//     `unable to call operation ${op}, this is probably a bug in Pact JS`
//   );
// };

const matcherValueOrString = (obj: unknown): string => {
  if (typeof obj === 'string') return obj;

  return JSON.stringify(obj);
};

const readBinaryData = (file: string): Buffer => {
  try {
    const body = fs.readFileSync(file);

    return body;
  } catch (e) {
    throw new Error(`unable to read file for binary request: ${e.message}`);
  }
};

export interface V3ProviderState {
  description: string;
  parameters?: JsonMap;
}

type TemplateHeaders = {
  [header: string]: string | MatchersV3.Matcher<string>;
};

type TemplateQuery = Record<
  string,
  | string
  | MatchersV3.Matcher<string>
  | Array<string | MatchersV3.Matcher<string>>
>;

export interface V3Request {
  method: string;
  path: string | MatchersV3.Matcher<string>;
  query?: TemplateQuery;
  headers?: TemplateHeaders;
  body?: MatchersV3.AnyTemplate;
  contentType?: string;
}

export interface V3Response {
  status: number;
  headers?: TemplateHeaders;
  body?: MatchersV3.AnyTemplate;
  contentType?: string;
}

export interface V3MockServer {
  port: number;
  url: string;
  id: string;
}

function displayQuery(query: Record<string, string[]>): string {
  const pairs = toPairs(query);
  const mapped = flatten(
    map(([key, values]) => map((val) => `${key}=${val}`, values), pairs)
  );
  return join('&', mapped);
}

function displayHeaders(
  headers: Record<string, string[]>,
  indent: string
): string {
  return join(
    `\n${indent}`,
    map(([k, v]) => `${k}: ${v}`, toPairs(headers))
  );
}

function displayRequest(request: RequestMismatch, indent = ''): string {
  const output: string[] = [''];

  output.push(
    `${indent}Method: ${request.method}\n${indent}Path: ${request.path}`
  );

  if (request.query) {
    output.push(`${indent}Query String: ${displayQuery(request.query)}`);
  }

  if (request.headers) {
    output.push(
      `${indent}Headers:\n${indent}  ${displayHeaders(
        request.headers,
        `${indent}  `
      )}`
    );
  }

  if (request.body) {
    const body = JSON.stringify(request.body);
    output.push(
      `${indent}Body: ${body.substr(0, 20)}... (${body.length} length)`
    );
  }

  return output.join('\n');
}

function filterMissingFeatureFlag(mismatches: MatchingResult[]) {
  if (process.env.PACT_EXPERIMENTAL_FEATURE_ALLOW_MISSING_REQUESTS) {
    return mismatches.filter((m) => m.type !== 'request-mismatch');
  }
  return mismatches;
}

function printMismatch(m: Mismatch): string {
  switch (m.type) {
    case 'MethodMismatch':
      return `Expected ${m.expected}, got: ${m.actual}`;
    default:
      return m.mismatch;
  }
}

function generateMockServerError(mismatches: MatchingResult[], indent: string) {
  return [
    'Mock server failed with the following mismatches:',
    ...mismatches.map((mismatch, i) => {
      if (mismatch.type === 'request-mismatch') {
        return `\n${indent}${i}) The following request was incorrect: \n
        ${indent}${mismatch.method} ${mismatch.path}
        ${mismatch.mismatches
          ?.map(
            (d, j) => `\n${indent}${indent}${indent} 1.${j} ${printMismatch(d)}`
          )
          .join('')}`;
      }
      if (mismatch.type === 'request-not-found') {
        return `\n${indent}${i}) The following request was not expected: ${displayRequest(
          (mismatch as MatchingResultRequestNotFound).request,
          `${indent}    `
        )}`;
      }
      if (mismatch.type === 'missing-request') {
        return `\n${indent}${i}) The following request was expected but not received: ${displayRequest(
          (mismatch as MatchingResultMissingRequest).request,
          `${indent}    `
        )}`;
      }
      return '';
    }),
  ].join('\n');
}

export class PactV3 {
  private opts: PactV3Options;

  private states: V3ProviderState[] = [];

  private pact: ConsumerPact;

  private interaction: ConsumerInteraction;

  constructor(opts: PactV3Options) {
    this.opts = opts;
    this.setup();
  }

  // TODO: this currently must be called before other methods, else it won't work
  public given(providerState: string, parameters?: JsonMap): PactV3 {
    this.states.push({ description: providerState, parameters });
    return this;
  }

  public uponReceiving(desc: string): PactV3 {
    this.interaction = this.pact.newInteraction(desc);
    this.states.forEach((s) => {
      if (s.parameters) {
        forEachObjIndexed((v, k) => {
          this.interaction.givenWithParam(
            s.description,
            `${k}`,
            JSON.stringify(v)
          );
        }, s.parameters);
      } else {
        this.interaction.given(s.description);
      }
    });
    return this;
  }

  public withRequest(req: V3Request): PactV3 {
    if (req.body) {
      this.interaction.withRequestBody(
        matcherValueOrString(req.body),
        req.contentType || 'application/json'
      );
    }

    this.setRequestDetails(req);
    return this;
  }

  public withRequestBinaryFile(
    req: V3Request,
    contentType: string,
    file: string
  ): PactV3 {
    const body = readBinaryData(file);
    this.interaction.withRequestBinaryBody(body, contentType);
    this.setRequestDetails(req);

    return this;
  }

  public withRequestMultipartFileUpload(
    req: V3Request,
    contentType: string,
    file: string,
    part: string
  ): PactV3 {
    this.interaction.withRequestMultipartBody(contentType, file, part);
    this.setRequestDetails(req);
    return this;
  }

  public willRespondWith(res: V3Response): PactV3 {
    this.setResponseDetails(res);
    if (res.body) {
      this.interaction.withResponseBody(
        matcherValueOrString(res.body),
        res.contentType || 'application/json' // TODO: extract // force correct content-type header?
      );
    }
    this.states = [];
    return this;
  }

  public withResponseBinaryFile(
    res: V3Response,
    contentType: string,
    file: string
  ): PactV3 {
    const body = readBinaryData(file);
    this.interaction.withResponseBinaryBody(body, contentType);
    this.setResponseDetails(res);
    return this;
  }

  public withResponseMultipartFileUpload(
    res: V3Response,
    contentType: string,
    file: string,
    part: string
  ): PactV3 {
    this.interaction.withResponseMultipartBody(contentType, file, part);
    this.setResponseDetails(res);
    return this;
  }

  public async executeTest<T>(
    testFn: (mockServer: V3MockServer) => Promise<T>
  ): Promise<T | undefined> {
    const scheme = 'http';
    const host = '127.0.0.1';

    const port = this.pact.createMockServer(host, this.opts.port);
    const server = { port, url: `${scheme}://${host}:${port}`, id: 'unknown' };
    let val: T | undefined;

    try {
      val = await testFn(server);
    } catch (e) {
      logger.error(e.message);
    }

    const matchingResults = this.pact.mockServerMismatches(port);
    const success = this.pact.mockServerMatchedSuccessfully(port);

    // Feature flag: allow missing requests on the mock service
    if (!success && filterMissingFeatureFlag(matchingResults).length > 0) {
      let error = 'Test failed for the following reasons:';
      error += `\n\n  ${generateMockServerError(matchingResults, '\t')}`;

      this.cleanup(false, server);
      return Promise.reject(new Error(error));
    }

    this.cleanup(true, server);
    return val;
  }

  private cleanup(success: boolean, server: V3MockServer) {
    if (success) {
      this.pact.writePactFile(server.port, this.opts.dir);
    }
    this.pact.cleanupMockServer(server.port);
    this.setup();
  }

  private setRequestDetails(req: V3Request) {
    this.interaction.withRequest(req.method, matcherValueOrString(req.path));
    forEachObjIndexed((v, k) => {
      this.interaction.withRequestHeader(k, 0, matcherValueOrString(v));
    }, req.headers);

    forEachObjIndexed((v, k) => {
      if (isArray(v)) {
        (v as unknown[]).forEach((vv, i) => {
          this.interaction.withQuery(k, i, matcherValueOrString(vv));
        });
      } else {
        this.interaction.withQuery(k, 0, matcherValueOrString(v));
      }
    }, req.query);
  }

  private setResponseDetails(res: V3Response) {
    this.interaction.withStatus(res.status);

    forEachObjIndexed((v, k) => {
      this.interaction.withResponseHeader(k, 0, matcherValueOrString(v));
    }, res.headers);
  }

  // reset the internal state
  // (this.pact cannot be re-used between tests)
  private setup() {
    this.states = [];
    this.pact = makeConsumerPact(
      this.opts.consumer,
      this.opts.provider,
      this.opts.spec ?? SpecificationVersion.SPECIFICATION_VERSION_V3,
      this.opts.logLevel ?? 'info'
    );
    this.pact.addMetadata('pact-js', 'version', pactPackageVersion);
  }
}
