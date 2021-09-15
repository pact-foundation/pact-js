import { omit, join, toPairs, map, flatten } from 'ramda';
import * as MatchersV3 from './matchers';
import { version as pactPackageVersion } from '../../package.json';

import PactNative, { Mismatch, MismatchRequest } from '../../native/index.node';
import { JsonMap } from '../common/jsonTypes';

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
}

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
  method?: string;
  path?: string | MatchersV3.Matcher<string>;
  query?: TemplateQuery;
  headers?: TemplateHeaders;
  body?: MatchersV3.AnyTemplate;
}

export interface V3Response {
  status: number;
  headers?: TemplateHeaders;
  body?: MatchersV3.AnyTemplate;
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

function displayHeaders(headers: TemplateHeaders, indent: string): string {
  return join(
    `\n${indent}`,
    map(([k, v]) => `${k}: ${v}`, toPairs(headers))
  );
}

function displayRequest(request?: MismatchRequest, indent = ''): string {
  const output: string[] = [''];

  if (!request) return '';

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

function filterMissingFeatureFlag(mismatches: Mismatch[]) {
  if (process.env.PACT_EXPERIMENTAL_FEATURE_ALLOW_MISSING_REQUESTS) {
    return mismatches.filter((m) => m.type !== 'missing-request');
  }
  return mismatches;
}

function extractMismatches(mockServerMismatches: string[]): Mismatch[] {
  return mockServerMismatches.map((mismatchJson) => JSON.parse(mismatchJson));
}

function generateMockServerError(mismatches: Mismatch[], indent: string) {
  return [
    'Mock server failed with the following mismatches:',
    ...mismatches.map((mismatch, i) => {
      if (mismatch.type === 'request-mismatch') {
        return `\n${indent}${i}) The following request was incorrect: \n
        ${indent}${mismatch.method} ${mismatch.path}
        ${mismatch.mismatches
          ?.map((d, j) => `\n${indent}${indent}${indent} 1.${j} ${d.mismatch}`)
          .join('')}`;
      }
      if (mismatch.type === 'request-not-found') {
        return `\n${indent}${i}) The following request was not expected: ${displayRequest(
          mismatch?.request,
          `${indent}    `
        )}`;
      }
      if (mismatch.type === 'missing-request') {
        return `\n${indent}${i}) The following request was expected but not received: ${displayRequest(
          mismatch?.request,
          `${indent}    `
        )}`;
      }
      return `${indent}${i}) ${mismatch.type} ${
        mismatch.path ? `(at ${mismatch.path}) ` : ''
      }${mismatch}`;
    }),
  ].join('\n');
}

export class PactV3 {
  private opts: PactV3Options;

  private states: V3ProviderState[] = [];

  private pact: PactNative.Pact;

  constructor(opts: PactV3Options) {
    this.opts = opts;
    this.setup();
  }

  public given(providerState: string, parameters?: JsonMap): PactV3 {
    this.states.push({ description: providerState, parameters });
    return this;
  }

  public uponReceiving(desc: string): PactV3 {
    this.pact.addInteraction(desc, this.states);
    return this;
  }

  public withRequest(req: V3Request): PactV3 {
    this.pact.addRequest(req, req.body);
    return this;
  }

  public withRequestBinaryFile(
    req: V3Request,
    contentType: string,
    file: string
  ): PactV3 {
    this.pact.addRequestBinaryFile(req, contentType, file);
    return this;
  }

  public withRequestMultipartFileUpload(
    req: V3Request,
    contentType: string,
    file: string,
    part: string
  ): PactV3 {
    this.pact.addRequestMultipartFileUpload(req, contentType, file, part);
    return this;
  }

  public willRespondWith(res: V3Response): PactV3 {
    this.pact.addResponse(res, res.body);
    this.states = [];
    return this;
  }

  public withResponseBinaryFile(
    res: V3Response,
    contentType: string,
    file: string
  ): PactV3 {
    this.pact.addResponseBinaryFile(res, contentType, file);
    return this;
  }

  public withResponseMultipartFileUpload(
    req: V3Response,
    contentType: string,
    file: string,
    part: string
  ): PactV3 {
    this.pact.addResponseMultipartFileUpload(req, contentType, file, part);
    return this;
  }

  public executeTest<T>(
    testFn: (mockServer: V3MockServer) => Promise<T>
  ): Promise<T> {
    const result = this.pact.executeTest(testFn, this.opts);
    if (result.testResult) {
      return result.testResult
        .then((val: T) => {
          const testResult = this.pact.getTestResult(result.mockServer.id);
          if (testResult.mockServerError) {
            return Promise.reject(new Error(testResult.mockServerError));
          }
          if (testResult.mockServerMismatches) {
            const mismatches = extractMismatches(
              testResult.mockServerMismatches
            );
            if (filterMissingFeatureFlag(mismatches).length > 0) {
              // Feature flag: allow missing requests on the mock service
              return Promise.reject(
                new Error(generateMockServerError(mismatches, '\t'))
              );
            }
          }

          this.pact.writePactFile(result.mockServer.id, this.opts);
          return val;
        })
        .catch((err: Error) => {
          const testResult = this.pact.getTestResult(result.mockServer.id);
          if (testResult.mockServerError || testResult.mockServerMismatches) {
            let error = 'Test failed for the following reasons:';

            if (testResult.mockServerError) {
              error += `\n\n  ${testResult.mockServerError}`;
            }
            if (testResult.mockServerMismatches) {
              error += `\n\n  ${generateMockServerError(
                extractMismatches(testResult.mockServerMismatches),
                '\t'
              )}`;
            }

            return Promise.reject(new Error(error));
          }
          return Promise.reject(err);
        })
        .finally(() => {
          this.pact.shutdownTest(result);
          this.setup();
        });
    }
    this.pact.shutdownTest(result);
    this.setup();
    return Promise.reject(result.testError);
  }

  // reset the internal state
  // (this.pact cannot be re-used between tests)
  private setup() {
    this.pact = new PactNative.Pact(
      this.opts.consumer,
      this.opts.provider,
      pactPackageVersion,
      omit(['consumer', 'provider', 'dir'], this.opts)
    );
  }
}
