/* eslint-disable */
import { Metadata } from '../../dsl/message';
import { AnyJson, JsonMap } from '../../common/jsonTypes';
import {
  PluginConfig,
  SynchronousMessage,
  AsynchronousMessage as ConcreteMessage,
  TransportConfig,
  V4MessageRequestBuilderFunc,
  V4MessageResponseBuilderFunc,
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
    protected opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  given(state: string, parameters?: JsonMap): V4UnconfiguredSynchronousMessage {
    if (parameters) {
      this.interaction.givenWithParams(state, JSON.stringify(parameters));
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
      this.opts,
      this.cleanupFn
    );
  }

  withRequest(
    builder: V4MessageRequestBuilderFunc
  ): V4SynchronousMessageWithRequest {
    builder(
      new SynchronousMessageWithRequestBuilder(
        this.pact,
        this.interaction,
        this.opts
      )
    );

    return new SynchronousMessageWithRequest(
      this.pact,
      this.interaction,
      this.opts,
      this.cleanupFn
    );
  }
}

export class SynchronousMessageWithPlugin
  implements V4SynchronousMessageWithPlugin
{
  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreSynchronousMessage,
    protected opts: PactV4Options,
    protected cleanupFn: () => void
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
      this.opts,
      this.cleanupFn
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

  withJSONContent(content: unknown): V4SynchronousMessageWithRequestBuilder {
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
    protected opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  withResponse(
    builder: V4MessageResponseBuilderFunc
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
      this.opts,
      this.cleanupFn
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
      this.interaction.withMetadata(`${k}`, JSON.stringify(v));
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

  withJSONContent(content: unknown): V4SynchronousMessageWithResponseBuilder {
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
    protected opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  executeTest<T>(
    integrationTest: (m: SynchronousMessage) => Promise<T>
  ): Promise<T | undefined> {
    return executeNonTransportTest(
      this.pact,
      this.opts,
      this.interaction,
      integrationTest,
      this.cleanupFn
    );
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
      address,
      this.cleanupFn
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
    protected address: string,
    protected cleanupFn: () => void
  ) {}

  // TODO: this is basically the same as the HTTP variant, except only with a different test function wrapper
  //       extract these into smaller, testable chunks and re-use them
  async executeTest<T>(
    integrationTest: (tc: TransportConfig, m: SynchronousMessage) => Promise<T>
  ): Promise<T | undefined> {
    let val: T | undefined;
    let error: Error | undefined;

    try {
      const request = this.interaction.getRequestContents();
      const response = this.interaction.getResponseContents();
      val = await integrationTest({ port: this.port, address: this.address }, {
        Request: {
          content: request,
        },
        Response: response.map((c) => ({
          content: c,
        })),
      } as SynchronousMessage);
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

      cleanup(false, this.pact, this.opts, this.cleanupFn, this.port, true);

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
      cleanup(false, this.pact, this.opts, this.cleanupFn, this.port, true);
      throw error;
    }

    // Scenario: Pact validation passed, test didn't throw - return the callback value
    cleanup(true, this.pact, this.opts, this.cleanupFn, this.port, true);

    return val;
  }
}

export class SynchronousMessageWithResponse
  implements V4SynchronousMessageWithResponse
{
  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreSynchronousMessage,
    protected opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  executeTest<T>(
    integrationTest: (m: SynchronousMessage) => Promise<T>
  ): Promise<T | undefined> {
    const res = executeNonTransportTest(
      this.pact,
      this.opts,
      this.interaction,
      integrationTest,
      this.cleanupFn
    );
    this.cleanupFn();

    return res;
  }
}

const cleanup = (
  success: boolean,
  pact: ConsumerPact,
  opts: PactV4Options,
  cleanupFn: () => void,
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
  cleanupFn();
};

const executeNonTransportTest = async <T>(
  pact: ConsumerPact,
  opts: PactV4Options,
  interaction: PactCoreSynchronousMessage,
  integrationTest: (m: SynchronousMessage) => Promise<T>,
  cleanupFn: () => void
): Promise<T | undefined> => {
  let val: T | undefined;
  let error: Error | undefined;

  try {
    const request = interaction.getRequestContents();
    const response = interaction.getResponseContents();
    val = await integrationTest({
      Request: {
        content: request,
      },
      Response: response.map((c) => ({
        content: c,
      })),
    } as SynchronousMessage);
  } catch (e) {
    error = e;
  }

  // Scenario: test threw an error, but Pact validation was OK (error in client or test)
  if (error) {
    cleanup(false, pact, opts, cleanupFn);

    throw error;
  }

  // Scenario: Pact validation passed, test didn't throw - return the callback value
  cleanup(true, pact, opts, cleanupFn);

  return val;
};

/**
 * A Message Consumer is a function that will receive a message
 * from a given Message Provider. It is given the full Message
 * context during verification.
 *
 * @module Message
 */
export type V4MessageConsumer = (m: ConcreteMessage) => Promise<unknown>;

// bodyHandler takes a synchronous function and returns
// a wrapped function that accepts a Message and returns a Promise
export function v4SynchronousBodyHandler<R>(
  handler: (body: AnyJson | Buffer) => R
): V4MessageConsumer {
  return (m: ConcreteMessage): Promise<R> => {
    const body = m.contents.content;

    return new Promise((resolve, reject) => {
      try {
        const res = handler(body);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };
}

// bodyHandler takes an asynchronous (promisified) function and returns
// a wrapped function that accepts a Message and returns a Promise
export function v4AsynchronousBodyHandler<R>(
  handler: (body: AnyJson | Buffer) => Promise<R>
): V4MessageConsumer {
  return (m: ConcreteMessage): Promise<R> => handler(m.contents.content);
}
