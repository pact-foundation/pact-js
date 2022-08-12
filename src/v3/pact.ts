/* eslint-disable import/first */
import { forEachObjIndexed, equals } from 'ramda';
import { makeConsumerPact } from '@pact-foundation/pact-core';
import {
  ConsumerPact,
  ConsumerInteraction,
} from '@pact-foundation/pact-core/src/consumer/index';
import { isArray } from 'util';
import fs = require('fs');
import { version as pactPackageVersion } from '../../package.json';
import { JsonMap } from '../common/jsonTypes';
import {
  PactV3Options,
  SpecificationVersion,
  TemplateHeaders,
  V3Interaction,
  V3MockServer,
  V3ProviderState,
  V3Request,
  V3Response,
} from './types';
import { matcherValueOrString } from './matchers';
import { MatchersV3 } from '../v3';
import { filterMissingFeatureFlag, generateMockServerError } from './display';

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
          contentTypeFromHeaders(res.headers, 'application/json') // TODO: extract // force correct content-type header?
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

    try {
      val = await testFn(server);
    } catch (e) {
      const matchingResults = this.pact.mockServerMismatches(port);
      let error = 'Test failed for the following reasons:';
      error += `\n\n  ${generateMockServerError(matchingResults, '\t')}`;

      this.cleanup(false, server);

      throw new Error((error += `\n\n Original exception: \n${e}`));
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

const setRequestDetails = (
  interaction: ConsumerInteraction,
  req: V3Request
) => {
  interaction.withRequest(req.method, matcherValueOrString(req.path));
  forEachObjIndexed((v, k) => {
    interaction.withRequestHeader(k, 0, matcherValueOrString(v));
  }, req.headers);

  forEachObjIndexed((v, k) => {
    if (isArray(v)) {
      (v as unknown[]).forEach((vv, i) => {
        interaction.withQuery(k, i, matcherValueOrString(vv));
      });
    } else {
      interaction.withQuery(k, 0, matcherValueOrString(v));
    }
  }, req.query);
};

const setResponseDetails = (
  interaction: ConsumerInteraction,
  res: V3Response
) => {
  interaction.withStatus(res.status);

  forEachObjIndexed((v, k) => {
    interaction.withResponseHeader(k, 0, matcherValueOrString(v));
  }, res.headers);
};

const contentTypeFromHeaders = (
  headers: TemplateHeaders | undefined,
  defaultContentType: string
) => {
  let contentType: string | MatchersV3.Matcher<string> = defaultContentType;
  forEachObjIndexed((v, k) => {
    if (`${k}`.toLowerCase() === 'content-type') {
      contentType = matcherValueOrString(v);
    }
  }, headers || {});

  return contentType;
};
