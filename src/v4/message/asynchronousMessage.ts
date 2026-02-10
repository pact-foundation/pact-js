/* eslint-disable */
import { Metadata } from '../../dsl/message';
import { AnyJson, JsonMap } from '../../common/jsonTypes';
import {
  PluginConfig,
  AsynchronousMessage,
  TransportConfig,
  V4AsynchronousMessageWithPlugin,
  V4AsynchronousMessageWithPluginContents,
  V4AsynchronousMessageWithTransport,
  V4UnconfiguredAsynchronousMessage,
  V4AsynchronousMessageWithContent,
  V4AsynchronousMessageBuilderFunc,
  V4AsynchronousMessageBuilder,
} from './types';
import {
  AsynchronousMessage as PactCoreAsynchronousMessage,
  ConsumerPact,
} from '@pact-foundation/pact-core';
import { PactV4Options } from '../http/types';
import { forEachObjIndexed, isEmpty } from 'ramda';
import ConfigurationError from '../../errors/configurationError';
import {
  filterMissingFeatureFlag,
  generateMockServerError,
} from '../../v3/display';
import { convertRulesToFFI, validateRules } from '../../common/matchingRules';
import { Rules } from '../../v3/types';
import logger from '../../common/logger';

const defaultPactDir = './pacts';

type Message = {
  requestIsBinary: boolean;
  interaction: PactCoreAsynchronousMessage;
};

type InteractionType =
  | 'Asynchronous/Messages'
  | 'Synchronous/Messages'
  | 'Synchronous/HTTP';

type ReifiedMessage = {
  contents: {
    content: AnyJson | Buffer;
    contentType: string;
    encoded: boolean;
  };
  metadata: Metadata;
  description: string;
  pending: boolean;
  providerStates: Array<{ name: string; params?: JsonMap }>;
  type: InteractionType;
  matchingRules: unknown;
};

export class UnconfiguredAsynchronousMessage
  implements V4UnconfiguredAsynchronousMessage
{
  protected message: Message;

  constructor(
    protected pact: ConsumerPact,
    protected interaction: PactCoreAsynchronousMessage,
    protected opts: PactV4Options,
    protected cleanupFn: () => void
  ) {
    this.message = {
      requestIsBinary: false,
      interaction: this.interaction,
    };
  }

  expectsToReceive(
    description: string,
    builder: V4AsynchronousMessageBuilderFunc
  ): AsynchronousMessageWithContent {
    this.interaction.expectsToReceive(description);

    builder(new AsynchronousMessageBuilder(this.pact, this.message, this.opts));

    return new AsynchronousMessageWithContent(
      this.pact,
      this.message,
      this.opts,
      this.cleanupFn
    );
  }

  given(
    state: string,
    parameters?: JsonMap
  ): V4UnconfiguredAsynchronousMessage {
    if (parameters) {
      this.message.interaction.givenWithParams(
        state,
        JSON.stringify(parameters)
      );
    } else {
      this.message.interaction.given(state);
    }

    return this;
  }

  usingPlugin(config: PluginConfig): V4AsynchronousMessageWithPlugin {
    this.pact.addPlugin(config.plugin, config.version);

    return new AsynchronousMessageWithPlugin(
      this.pact,
      this.message,
      this.opts,
      this.cleanupFn
    );
  }
}

export class AsynchronousMessageWithPlugin
  implements V4AsynchronousMessageWithPlugin
{
  constructor(
    protected pact: ConsumerPact,
    protected message: Message,
    protected opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  expectsToReceive(description: string): V4AsynchronousMessageWithPlugin {
    this.message.interaction.expectsToReceive(description);

    return this;
  }

  usingPlugin(config: PluginConfig): V4AsynchronousMessageWithPlugin {
    this.pact.addPlugin(config.plugin, config.version);

    return this;
  }

  withPluginContents(
    contents: string,
    contentType: string
  ): V4AsynchronousMessageWithPluginContents {
    this.message.interaction.withPluginRequestInteractionContents(
      contentType,
      contents
    );

    return new AsynchronousMessageWithPluginContents(
      this.pact,
      this.message,
      this.opts,
      this.cleanupFn
    );
  }
}

export class AsynchronousMessageBuilder
  implements V4AsynchronousMessageBuilder
{
  constructor(
    protected pact: ConsumerPact,
    protected message: Message,
    protected opts: PactV4Options
  ) {}

  withMetadata(metadata: Metadata): V4AsynchronousMessageBuilder {
    if (isEmpty(metadata)) {
      throw new ConfigurationError(
        'You must provide valid metadata for the Message, or none at all'
      );
    }

    forEachObjIndexed((v, k) => {
      this.message.interaction.withMetadata(`${k}`, JSON.stringify(v));
    }, metadata);

    return this;
  }

  withContent(contentType: string, body: Buffer): V4AsynchronousMessageBuilder {
    this.message.interaction.withBinaryContents(body, contentType);
    this.message.requestIsBinary = true;

    return this;
  }

  withJSONContent(content: unknown): V4AsynchronousMessageBuilder {
    if (isEmpty(content)) {
      throw new ConfigurationError(
        'You must provide a valid JSON document or primitive for the Message.'
      );
    }
    this.message.interaction.withContents(
      JSON.stringify(content),
      'application/json'
    );

    return this;
  }

  withMatchingRules(rules: Rules): V4AsynchronousMessageBuilder {
    validateRules(rules);
    const ffiRules = convertRulesToFFI(rules);
    this.message.interaction.withMatchingRules(JSON.stringify(ffiRules));

    return this;
  }
}

export class AsynchronousMessageWithContent
  implements V4AsynchronousMessageWithContent
{
  constructor(
    protected pact: ConsumerPact,
    protected message: Message,
    protected opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  executeTest<T>(
    integrationTest: (m: AsynchronousMessage) => Promise<T>
  ): Promise<T | undefined> {
    return executeNonTransportTest(
      this.pact,
      this.opts,
      this.message,
      integrationTest,
      this.cleanupFn
    );
  }
}

export class AsynchronousMessageWithPluginContents
  implements V4AsynchronousMessageWithPluginContents
{
  constructor(
    protected pact: ConsumerPact,
    protected message: Message,
    protected opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  executeTest<T>(
    integrationTest: (m: AsynchronousMessage) => Promise<T>
  ): Promise<T | undefined> {
    return executeNonTransportTest(
      this.pact,
      this.opts,
      this.message,
      integrationTest,
      this.cleanupFn
    );
  }

  startTransport(
    transport: string,
    address: string, // IP Address or hostname
    config?: AnyJson
  ): V4AsynchronousMessageWithTransport {
    const port = this.pact.pactffiCreateMockServerForTransport(
      address,
      transport,
      config ? JSON.stringify(config) : ''
    );

    return new AsynchronousMessageWithTransport(
      this.pact,
      this.message,
      this.opts,
      port,
      address,
      this.cleanupFn
    );
  }
}

export class AsynchronousMessageWithTransport
  implements V4AsynchronousMessageWithTransport
{
  constructor(
    protected pact: ConsumerPact,
    protected message: Message,
    protected opts: PactV4Options,
    protected port: number,
    protected address: string,
    protected cleanupFn: () => void
  ) {}

  // TODO: this is basically the same as the HTTP variant, except only with a different test function wrapper
  //       extract these into smaller, testable chunks and re-use them
  async executeTest<T>(
    integrationTest: (tc: TransportConfig, m: AsynchronousMessage) => Promise<T>
  ): Promise<T | undefined> {
    let val: T | undefined;
    let error: Error | undefined;

    try {
      // TODO: need to pull this body from the plugin interaction
      val = await integrationTest(
        { port: this.port, address: this.address },
        {} as AsynchronousMessage
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
  message: Message,
  integrationTest: (m: AsynchronousMessage) => Promise<T>,
  cleanupFn: () => void
): Promise<T | undefined> => {
  let val: T | undefined;
  let error: Error | undefined;

  try {
    const rawInteraction: ReifiedMessage = JSON.parse(
      message.interaction.reifyMessage()
    );

    const { content, contentType, encoded } = rawInteraction.contents;
    const m: AsynchronousMessage = {
      contents: {
        content: !message.requestIsBinary
          ? content
          : Buffer.from(content as string, 'base64'),
      },
      metadata: rawInteraction.metadata,
    };
    val = await integrationTest(m);
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
