/* eslint-disable */
import { Metadata } from '../../dsl/message';
import { AnyTemplate } from '../../v3/matchers';
import { AnyJson, JsonMap } from '../../common/jsonTypes';
import {
  PluginConfig,
  SynchronousMessage,
  TransportConfig,
  V4MessagePluginRequestBuilderFunc,
  V4MessagePluginResponseBuilderFunc,
  V4SynchronousMessageWithPlugin,
  V4SynchronousMessageWithPluginContents,
  V4SynchronousMessageWithRequest,
  V4SynchronousMessageWithRequestBuilder,
  V4SynchronousMessageWithResponse,
  V4SynchronousMessageWithResponseBuilder,
  V4SynchronousMessageWithTransport,
  V4UnconfiguredSynchronousMessage,
} from './types';
import {
  SynchronousMessage as PactCoreSynchronousMessage,
  ConsumerPact,
} from '@pact-foundation/pact-core';
import { PactV4Options } from '../http/types';
import { forEachObjIndexed, isEmpty } from 'ramda';
import ConfigurationError from '../../errors/configurationError';
import {
  filterMissingFeatureFlag,
  generateMockServerError,
} from '../../v3/display';
import logger from '../../common/logger';

const defaultPactDir = './pacts';

export class UnconfiguredSynchronousMessage
  implements V4UnconfiguredSynchronousMessage
{
  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreSynchronousMessage,
    protected opts: PactV4Options
  ) {}

  given(state: string, parameters?: JsonMap): V4UnconfiguredSynchronousMessage {
    if (parameters) {
      forEachObjIndexed((v, k) => {
        this.interaction.givenWithParam(state, `${k}`, JSON.stringify(v));
      }, parameters);
    } else {
      this.interaction.given(state);
    }

    return this;
  }

  usingPlugin(config: PluginConfig): V4SynchronousMessageWithPlugin {
    this.pact.addPlugin(config.plugin, config.version);

    return new SynchronousMessageWithPlugin(
      this.pact,
      this.interaction,
      this.opts
    );
  }

  withRequest(
    r: V4MessagePluginRequestBuilderFunc
  ): V4SynchronousMessageWithRequest {
    return new SynchronousMessageWithRequest(
      this.pact,
      this.interaction,
      this.opts
    );
  }
}

export class SynchronousMessageWithPlugin
  implements V4SynchronousMessageWithPlugin
{
  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreSynchronousMessage,
    protected opts: PactV4Options
  ) {}

  usingPlugin(config: PluginConfig): V4SynchronousMessageWithPlugin {
    this.pact.addPlugin(config.plugin, config.version);

    return this;
  }

  withPluginContents(
    contents: string,
    contentType: string
  ): V4SynchronousMessageWithPluginContents {
    this.interaction.withPluginRequestResponseInteractionContents(
      contentType,
      contents
    );

    return new SynchronousMessageWithPluginContents(
      this.pact,
      this.interaction,
      this.opts
    );
  }
}

export class SynchronousMessageWithRequestBuilder
  implements V4SynchronousMessageWithRequestBuilder
{
  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreSynchronousMessage,
    protected opts: PactV4Options
  ) {}

  withContent(
    contentType: string,
    body: Buffer
  ): V4SynchronousMessageWithRequestBuilder {
    this.interaction.withRequestBinaryContents(body, contentType);

    return this;
  }

  withJSONContent(
    content: AnyTemplate
  ): V4SynchronousMessageWithRequestBuilder {
    if (isEmpty(content)) {
      throw new ConfigurationError(
        'You must provide a valid JSON document or primitive for the Message.'
      );
    }
    this.interaction.withRequestContents(
      JSON.stringify(content),
      'application/json'
    );

    return this;
  }
}

export class SynchronousMessageWithRequest
  implements V4SynchronousMessageWithRequest
{
  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreSynchronousMessage,
    protected opts: PactV4Options
  ) {}

  withResponse(
    builder: V4MessagePluginResponseBuilderFunc
  ): V4SynchronousMessageWithResponse {
    builder(
      new SynchronousMessageWithResponseBuilder(
        this.pact,
        this.interaction,
        this.opts
      )
    );

    return new SynchronousMessageWithResponse(
      this.pact,
      this.interaction,
      this.opts
    );
  }
}

export class SynchronousMessageWithResponseBuilder
  implements V4SynchronousMessageWithResponseBuilder
{
  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreSynchronousMessage,
    protected opts: PactV4Options
  ) {}

  withMetadata(metadata: Metadata): V4SynchronousMessageWithResponseBuilder {
    if (isEmpty(metadata)) {
      throw new ConfigurationError(
        'You must provide valid metadata for the Message, or none at all'
      );
    }

    forEachObjIndexed((v, k) => {
      this.interaction.withMetadata(
        `${k}`,
        typeof v === 'string' ? v : v.getValue()
      );
    }, metadata);

    return this;
  }

  withContent(
    contentType: string,
    body: Buffer
  ): V4SynchronousMessageWithResponseBuilder {
    this.interaction.withResponseBinaryContents(body, contentType);

    return this;
  }

  withJSONContent(
    content: AnyTemplate
  ): V4SynchronousMessageWithResponseBuilder {
    if (isEmpty(content)) {
      throw new ConfigurationError(
        'You must provide a valid JSON document or primitive for the Message.'
      );
    }
    this.interaction.withResponseContents(
      JSON.stringify(content),
      'application/json'
    );

    return this;
  }
}

export class SynchronousMessageWithPluginContents
  implements V4SynchronousMessageWithPluginContents
{
  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreSynchronousMessage,
    protected opts: PactV4Options
  ) {}

  executeTest<T>(
    integrationTest: (m: SynchronousMessage) => Promise<T>
  ): Promise<T | undefined> {
    return executeNonTransportTest(this.pact, this.opts, integrationTest);
  }

  startTransport(
    transport: string,
    address: string, // IP Address or hostname
    config?: AnyJson
  ): V4SynchronousMessageWithTransport {
    const port = this.pact.pactffiCreateMockServerForTransport(
      address,
      transport,
      config ? JSON.stringify(config) : ''
    );

    return new SynchronousMessageWithTransport(
      this.pact,
      this.interaction,
      this.opts,
      port,
      address
    );
  }
}

export class SynchronousMessageWithTransport
  implements V4SynchronousMessageWithTransport
{
  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreSynchronousMessage,
    protected opts: PactV4Options,
    protected port: number,
    protected address: string
  ) {}

  // TODO: this is basically the same as the HTTP variant, except only with a different test function wrapper
  //       extract these into smaller, testable chunks and re-use them
  async executeTest<T>(
    integrationTest: (tc: TransportConfig, m: SynchronousMessage) => Promise<T>
  ): Promise<T | undefined> {
    let val: T | undefined;
    let error: Error | undefined;

    try {
      val = await integrationTest(
        { port: this.port, address: this.address },
        {} as SynchronousMessage
      );
    } catch (e) {
      error = e;
    }

    const matchingResults = this.pact.mockServerMismatches(this.port);
    const errors = filterMissingFeatureFlag(matchingResults);
    const success = this.pact.mockServerMatchedSuccessfully(this.port);

    // Scenario: Pact validation failed
    if (!success && errors.length > 0) {
      let errorMessage = 'Test failed for the following reasons:';
      errorMessage += `\n\n  ${generateMockServerError(matchingResults, '\t')}`;

      cleanup(false, this.pact, this.opts, this.port, true);

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
      cleanup(false, this.pact, this.opts, this.port, true);
      throw error;
    }

    // Scenario: Pact validation passed, test didn't throw - return the callback value
    cleanup(true, this.pact, this.opts, this.port, true);

    return val;
  }
}

export class SynchronousMessageWithResponse
  implements V4SynchronousMessageWithResponse
{
  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreSynchronousMessage,
    protected opts: PactV4Options
  ) {}

  executeTest<T>(
    integrationTest: (m: SynchronousMessage) => Promise<T>
  ): Promise<T | undefined> {
    return executeNonTransportTest(this.pact, this.opts, integrationTest);
  }
}

const cleanup = (
  success: boolean,
  pact: ConsumerPact,
  opts: PactV4Options,
  port?: number,
  transport = false
) => {
  if (success) {
    if (transport && port) {
      pact.writePactFileForPluginServer(port, opts.dir || defaultPactDir, true);
    } else {
      pact.writePactFile(opts.dir || defaultPactDir);
    }
  }
  if (port) {
    pact.cleanupMockServer(port);
  }
  pact.cleanupPlugins();
};

const executeNonTransportTest = async <T>(
  pact: ConsumerPact,
  opts: PactV4Options,
  integrationTest: (m: SynchronousMessage) => Promise<T>
): Promise<T | undefined> => {
  let val: T | undefined;
  let error: Error | undefined;

  try {
    val = await integrationTest({} as SynchronousMessage);
  } catch (e) {
    error = e;
  }

  // Scenario: test threw an error, but Pact validation was OK (error in client or test)
  if (error) {
    cleanup(false, pact, opts);

    throw error;
  }

  // Scenario: Pact validation passed, test didn't throw - return the callback value
  cleanup(true, pact, opts);

  return val;
};
