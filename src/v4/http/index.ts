/* eslint-disable */
import { ConsumerInteraction, ConsumerPact } from '@pact-foundation/pact-core';
import { JsonMap } from '../../common/jsonTypes';
import { forEachObjIndexed } from 'ramda';
import { Path, TemplateHeaders, TemplateQuery, V3MockServer } from '../../v3';
import { AnyTemplate, matcherValueOrString } from '../../v3/matchers';
import {
  PactV4Options,
  PluginConfig,
  V4InteractionWithCompleteRequest,
  V4InteractionWithPlugin,
  V4InteractionwithRequest,
  V4InteractionWithResponse,
  V4MockServer,
  V4Request,
  V4RequestBuilder,
  V4RequestBuilderFunc,
  V4ResponseBuilder,
  V4ResponseBuilderFunc,
  V4UnconfiguredInteraction,
  V4Response,
  V4InteractionWithPluginRequest,
  V4PluginResponseBuilderFunc,
  V4InteractionWithPluginResponse,
  V4RequestWithPluginBuilder,
  V4ResponseWithPluginBuilder,
  V4PluginRequestBuilderFunc,
  TestFunction,
} from './types';
import fs = require('fs');
import {
  filterMissingFeatureFlag,
  generateMockServerError,
} from '../../v3/display';
import logger from '../../common/logger';

export class UnconfiguredInteraction implements V4UnconfiguredInteraction {
  // tslint:disable:no-empty-function
  constructor(
    protected pact: ConsumerPact,
    protected interaction: ConsumerInteraction,
    protected opts: PactV4Options
  ) {}

  uponReceiving(description: string): V4UnconfiguredInteraction {
    this.interaction.uponReceiving(description);

    return this;
  }

  given(state: string, parameters?: JsonMap): V4UnconfiguredInteraction {
    if (parameters) {
      forEachObjIndexed((v, k) => {
        this.interaction.givenWithParam(state, `${k}`, JSON.stringify(v));
      }, parameters);
    } else {
      this.interaction.given(state);
    }

    return this;
  }

  withCompleteRequest(request: V4Request): V4InteractionWithCompleteRequest {
    return new InteractionWithCompleteRequest(
      this.pact,
      this.interaction,
      this.opts
    );
  }

  withRequest(
    method: string,
    path: Path,
    builder?: V4RequestBuilderFunc
  ): V4InteractionwithRequest {
    this.interaction.withRequest(method, matcherValueOrString(path));

    if (builder) {
      builder(new RequestBuilder(this.interaction));
    }
    return new InteractionwithRequest(this.pact, this.interaction, this.opts);
  }

  usingPlugin(config: PluginConfig): V4InteractionWithPlugin {
    this.pact.addPlugin(config.plugin, config.version);

    return new InteractionWithPlugin(this.pact, this.interaction, this.opts);
  }
}

export class InteractionWithCompleteRequest
  implements V4InteractionWithCompleteRequest
{
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options
  ) {
    throw Error('V4InteractionWithCompleteRequest is unimplemented');
  }

  withCompleteResponse(response: V4Response): V4InteractionWithResponse {
    return new InteractionWithResponse(this.pact, this.interaction, this.opts);
  }
}

export class InteractionwithRequest implements V4InteractionwithRequest {
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options
  ) {}

  willRespondWith(status: number, builder?: V4ResponseBuilderFunc) {
    return new InteractionWithResponse(this.pact, this.interaction, this.opts);
  }
}

export class RequestBuilder implements V4RequestBuilder {
  // tslint:disable:no-empty-function
  constructor(protected interaction: ConsumerInteraction) {}

  query(query: TemplateQuery) {
    forEachObjIndexed((v, k) => {
      if (Array.isArray(v)) {
        (v as unknown[]).forEach((vv, i) => {
          this.interaction.withQuery(k, i, matcherValueOrString(vv));
        });
      } else {
        this.interaction.withQuery(k, 0, matcherValueOrString(v));
      }
    }, query);

    return this;
  }

  headers(headers: TemplateHeaders) {
    forEachObjIndexed((v, k) => {
      this.interaction.withRequestHeader(`${k}`, 0, matcherValueOrString(v));
    }, headers);

    return this;
  }

  jsonBody(body: AnyTemplate) {
    this.interaction.withRequestBody(
      matcherValueOrString(body),
      'application/json'
    );
    return this;
  }

  binaryFile(contentType: string, file: string) {
    const body = readBinaryData(file);
    this.interaction.withRequestBinaryBody(body, contentType);

    return this;
  }

  multipartBody(contentType: string, file: string, mimePartName: string) {
    this.interaction.withRequestMultipartBody(contentType, file, mimePartName);

    return this;
  }

  body(contentType: string, body: Buffer) {
    this.interaction.withRequestBinaryBody(body, contentType);

    return this;
  }
}

export class ResponseBuilder implements V4ResponseBuilder {
  protected interaction: ConsumerInteraction;

  // tslint:disable:no-empty-function
  constructor(interaction: ConsumerInteraction) {
    this.interaction = interaction;
  }

  headers(headers: TemplateHeaders) {
    forEachObjIndexed((v, k) => {
      this.interaction.withResponseHeader(`${k}`, 0, matcherValueOrString(v));
    }, headers);

    return this;
  }

  jsonBody(body: AnyTemplate) {
    this.interaction.withResponseBody(
      matcherValueOrString(body),
      'application/json'
    );
    return this;
  }

  binaryFile(contentType: string, file: string) {
    const body = readBinaryData(file);
    this.interaction.withResponseBinaryBody(body, contentType);

    return this;
  }

  multipartBody(contentType: string, file: string, mimePartName: string) {
    this.interaction.withResponseMultipartBody(contentType, file, mimePartName);

    return this;
  }

  body(contentType: string, body: Buffer) {
    this.interaction.withResponseBinaryBody(body, contentType);

    return this;
  }
}

export class InteractionWithResponse implements V4InteractionWithResponse {
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options
  ) {}

  async executeTest<T>(testFn: TestFunction<T>) {
    return executeTest(this.pact, this.opts, testFn);
  }
}

export class InteractionWithPlugin implements V4InteractionWithPlugin {
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options
  ) {}

  // Multiple plugins are allowed
  usingPlugin(config: PluginConfig): V4InteractionWithPlugin {
    this.pact.addPlugin(config.plugin, config.version);

    return this;
  }

  withRequest(
    method: string,
    path: Path,
    builder?: V4PluginRequestBuilderFunc
  ): V4InteractionWithPluginRequest {
    this.interaction.withRequest(method, matcherValueOrString(path));

    if (typeof builder === 'function') {
      builder(new RequestWithPluginBuilder(this.interaction));
    }
    return new InteractionWithPluginRequest(
      this.pact,
      this.interaction,
      this.opts
    );
  }
}

export class InteractionWithPluginRequest
  implements V4InteractionWithPluginRequest
{
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options
  ) {}

  willRespondWith(
    status: number,
    builder?: V4PluginResponseBuilderFunc
  ): V4InteractionWithPluginResponse {
    if (typeof builder === 'function') {
      builder(new ResponseWithPluginBuilder(this.interaction));
    }

    return new InteractionWithPluginResponse(
      this.pact,
      this.interaction,
      this.opts
    );
  }
}

export class RequestWithPluginBuilder
  extends RequestBuilder
  implements V4RequestWithPluginBuilder
{
  pluginContents(
    contentType: string,
    contents: string
  ): V4RequestWithPluginBuilder {
    this.interaction.withPluginRequestInteractionContents(
      contentType,
      contents
    );

    return this;
  }
}

export class ResponseWithPluginBuilder
  extends ResponseBuilder
  implements V4ResponseWithPluginBuilder
{
  pluginContents(contentType: string, contents: string): V4ResponseBuilder {
    this.interaction.withPluginResponseInteractionContents(
      contentType,
      contents
    );
    return this;
  }
}

export class InteractionWithPluginResponse
  implements V4InteractionWithPluginResponse
{
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options
  ) {}

  async executeTest<T>(testFn: (mockServer: V4MockServer) => Promise<T>) {
    return executeTest(this.pact, this.opts, testFn);
  }
}
const readBinaryData = (file: string): Buffer => {
  try {
    const body = fs.readFileSync(file);

    return body;
  } catch (e) {
    throw new Error(`unable to read file for binary payload : ${e.message}`);
  }
};

const cleanup = (
  success: boolean,
  pact: ConsumerPact,
  opts: PactV4Options,
  server: V3MockServer
) => {
  if (success) {
    pact.writePactFile(opts.dir || './pacts');
  }
  pact.cleanupMockServer(server.port);
  pact.cleanupPlugins();
};

const executeTest = async <T>(
  pact: ConsumerPact,
  opts: PactV4Options,
  testFn: TestFunction<T>
) => {
  const scheme = opts.tls ? 'https' : 'http';
  const host = opts.host || '127.0.0.1';
  const port = pact.createMockServer(host, opts.port || 0, false);

  const server = { port, url: `${scheme}://${host}:${port}`, id: 'unknown' };
  let val: T | undefined;
  let error: Error | undefined;

  try {
    val = await testFn(server);
  } catch (e) {
    error = e;
  }

  const matchingResults = pact.mockServerMismatches(port);
  const errors = filterMissingFeatureFlag(matchingResults);
  const success = pact.mockServerMatchedSuccessfully(port);

  // Scenario: Pact validation failed
  if (!success && errors.length > 0) {
    let errorMessage = 'Test failed for the following reasons:';
    errorMessage += `\n\n  ${generateMockServerError(matchingResults, '\t')}`;

    cleanup(false, pact, opts, server);

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
    cleanup(false, pact, opts, server);
    throw error;
  }

  // Scenario: Pact validation passed, test didn't throw - return the callback value
  cleanup(true, pact, opts, server);

  return val;
};
