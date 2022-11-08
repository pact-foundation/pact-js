/* eslint-disable import/first */
import { forEachObjIndexed, equals } from 'ramda';
import { makeConsumerPact } from '@pact-foundation/pact-core';
import {
  ConsumerPact,
  ConsumerInteraction,
} from '@pact-foundation/pact-core/src/consumer/index';
import fs = require('fs');
import { version as pactPackageVersion } from '../../package.json';
import { JsonMap } from '../common/jsonTypes';
import {
  PactV3Options,
  SpecificationVersion,
  V3Interaction,
  V3MockServer,
  V3ProviderState,
  V3Request,
  V3Response,
} from './types';
import { matcherValueOrString } from './matchers';
import { filterMissingFeatureFlag, generateMockServerError } from './display';
import logger from '../common/logger';
import {
  contentTypeFromHeaders,
  setRequestDetails,
  setResponseDetails,
} from './ffi';

const readBinaryData = (file: string): Buffer => {
  try {
    const body = fs.readFileSync(file);

    return body;
  } catch (e) {
    throw new Error(`unable to read file for binary request: ${e.message}`);
  }
};

export class PactV3 {
  private opts: PactV3Options;

  private states: V3ProviderState[] = [];

  private pact: ConsumerPact;

  private interaction: ConsumerInteraction;

  constructor(opts: PactV3Options) {
    this.opts = opts;
    this.setup();
  }

  // JSON object interface for V3, to aid with migration from the previous major version
  public addInteraction(interaction: V3Interaction): PactV3 {
    if (interaction.uponReceiving === '') {
      throw new Error(
        "must provide a valid interaction description via 'uponReceiving'"
      );
    }

    (interaction.states || []).forEach((s) => {
      this.given(s.description, s.parameters);
    });
    this.uponReceiving(interaction.uponReceiving);
    this.withRequest(interaction.withRequest);
    this.willRespondWith(interaction.willRespondWith);

    return this;
  }

  // TODO: this currently must be called before other methods, else it won't work
  public given(providerState: string, parameters?: JsonMap): PactV3 {
    if (parameters) {
      const json = JSON.stringify(parameters);

      // undefined arguments not supported (invalid JSON)
      if (json === undefined) {
        throw new Error(
          `Invalid provider state parameter received. Parameters must not be undefined. Received: ${parameters}`
        );
      }

      // Check nested objects
      const jsonParsed = JSON.parse(json);

      if (!equals(parameters, jsonParsed)) {
        throw new Error(
          `Invalid provider state parameter received. Parameters must not contain undefined values. Received: ${parameters}`
        );
      }
    }

    this.states.push({ description: providerState, parameters });
    return this;
  }

  public uponReceiving(description: string): PactV3 {
    this.interaction = this.pact.newInteraction(description);
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
        req.contentType ||
          contentTypeFromHeaders(req.headers, 'application/json')
      );
    }

    setRequestDetails(this.interaction, req);
    return this;
  }

  public withRequestBinaryFile(
    req: V3Request,
    contentType: string,
    file: string
  ): PactV3 {
    const body = readBinaryData(file);
    this.interaction.withRequestBinaryBody(body, contentType);
    setRequestDetails(this.interaction, req);

    return this;
  }

  public withRequestMultipartFileUpload(
    req: V3Request,
    contentType: string,
    file: string,
    mimePartName: string
  ): PactV3 {
    this.interaction.withRequestMultipartBody(contentType, file, mimePartName);
    setRequestDetails(this.interaction, req);
    return this;
  }

  public willRespondWith(res: V3Response): PactV3 {
    setResponseDetails(this.interaction, res);
    if (res.body) {
      this.interaction.withResponseBody(
        matcherValueOrString(res.body),
        res.contentType ||
          contentTypeFromHeaders(res.headers, 'application/json')
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
    setResponseDetails(this.interaction, res);
    return this;
  }

  public withResponseMultipartFileUpload(
    res: V3Response,
    contentType: string,
    file: string,
    mimePartName: string
  ): PactV3 {
    this.interaction.withResponseMultipartBody(contentType, file, mimePartName);
    setResponseDetails(this.interaction, res);
    return this;
  }

  public async executeTest<T>(
    testFn: (mockServer: V3MockServer) => Promise<T>
  ): Promise<T | undefined> {
    const scheme = this.opts.tls ? 'https' : 'http';
    const host = this.opts.host || '127.0.0.1';

    const port = this.pact.createMockServer(
      host,
      this.opts.port,
      this.opts.tls
    );
    const server = { port, url: `${scheme}://${host}:${port}`, id: 'unknown' };
    let val: T | undefined;
    let error: Error | undefined;

    try {
      val = await testFn(server);
    } catch (e) {
      error = e;
    }

    const matchingResults = this.pact.mockServerMismatches(port);
    const errors = filterMissingFeatureFlag(matchingResults);
    const success = this.pact.mockServerMatchedSuccessfully(port);

    // Scenario: Pact validation failed
    if (!success && errors.length > 0) {
      let errorMessage = 'Test failed for the following reasons:';
      errorMessage += `\n\n  ${generateMockServerError(matchingResults, '\t')}`;

      this.cleanup(false, server);

      // If the tests throws an error, we need to rethrow the error, but print out
      // any additional mock server errors to help the user understand what happened
      // (The proximate cause here is often the HTTP 500 from the mock server,
      // where the HTTP client then throws)
      if (error) {
        logger.error(errorMessage);
        throw error;
      }

      // Test didn't throw, so we need to ensure the test fails
      return Promise.reject(new Error(errorMessage));
    }

    // Scenario: test threw an error, but Pact validation was OK (error in client or test)
    if (error) {
      this.cleanup(false, server);
      throw error;
    }

    // Scenario: Pact validation passed, test didn't throw - return the callback value
    this.cleanup(true, server);
    return val;
  }

  private cleanup(success: boolean, server: V3MockServer) {
    if (success) {
      this.pact.writePactFile(this.opts.dir || './pacts');
    }
    this.pact.cleanupMockServer(server.port);
    this.setup();
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
