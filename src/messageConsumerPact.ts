/**
 * @module Message
 */

import { isEmpty } from 'lodash';
import serviceFactory, {
  AsynchronousMessage,
  makeConsumerAsyncMessagePact,
  ConsumerMessagePact,
} from '@pact-foundation/pact-core';
import { forEachObjIndexed } from 'ramda';
import { AnyJson } from './common/jsonTypes';
import { AnyTemplate } from './dsl/matchers';
import {
  Metadata,
  Message,
  MessageConsumer,
  ConcreteMessage,
  ProviderState,
} from './dsl/message';
import logger, { setLogLevel } from './common/logger';
import { MessageConsumerOptions } from './dsl/options';
import ConfigurationError from './errors/configurationError';
import { version as pactPackageVersion } from '../package.json';
import { numberToSpec } from './common/spec';
import { SpecificationVersion } from './v3';

const DEFAULT_PACT_DIR = './pacts';

// eslint-disable-next-line no-shadow
enum ContentType {
  JSON,
  BINARY,
  STRING,
}

type InternalMessageState = {
  contentType: ContentType;
};

/**
 * A Message Consumer is analagous to a Provider in the HTTP Interaction model.
 * It is the receiver of an interaction, and needs to be able to handle whatever
 * request was provided.
 */
export class MessageConsumerPact {
  private state: Partial<InternalMessageState> = {};

  private pact: ConsumerMessagePact;

  private message: AsynchronousMessage;

  constructor(private config: MessageConsumerOptions) {
    this.pact = makeConsumerAsyncMessagePact(
      config.consumer,
      config.provider,
      numberToSpec(config.spec, SpecificationVersion.SPECIFICATION_VERSION_V3),
      config.logLevel
    );
    this.pact.addMetadata('pact-js', 'version', pactPackageVersion);
    this.message = this.pact.newMessage('');

    if (!isEmpty(config.logLevel)) {
      setLogLevel(config.logLevel);
      serviceFactory.logLevel(config.logLevel);
    }
  }

  /**
   * Gives a state the provider should be in for this Message.
   *
   * @param {string} state - The state of the provider.
   * @returns {Message} MessageConsumer
   */
  public given(state: string | ProviderState): MessageConsumerPact {
    if (typeof state === 'string') {
      this.message.given(state);
    } else {
      forEachObjIndexed((v, k) => {
        this.message.givenWithParam(state.name, `${k}`, JSON.stringify(v));
      }, state.params);
    }

    return this;
  }

  /**
   * A free style description of the Message.
   *
   * @param {string} description - A description of the Message to be received
   * @returns {Message} MessageConsumer
   */
  public expectsToReceive(description: string): MessageConsumerPact {
    if (isEmpty(description)) {
      throw new ConfigurationError(
        'You must provide a description for the Message.'
      );
    }
    this.message.expectsToReceive(description);

    return this;
  }

  /**
   * The JSON object to be received by the message consumer.
   *
   * May be a JSON object or JSON primitive. The contents must be able to be properly
   * strigified and parse (i.e. via JSON.stringify and JSON.parse).
   *
   * @param {string} content - A description of the Message to be received
   * @returns {Message} MessageConsumer
   */
  public withContent(content: AnyTemplate): MessageConsumerPact {
    if (isEmpty(content)) {
      throw new ConfigurationError(
        'You must provide a valid JSON document or primitive for the Message.'
      );
    }
    this.message.withContents(JSON.stringify(content), 'application/json');
    this.state.contentType = ContentType.JSON;

    return this;
  }

  /**
   * The text content to be received by the message consumer.
   *
   * May be any text
   *
   * @param {string} content - A description of the Message to be received
   * @returns {Message} MessageConsumer
   */
  public withTextContent(
    content: string,
    contentType: string
  ): MessageConsumerPact {
    this.message.withContents(content, contentType);
    this.state.contentType = ContentType.STRING;

    return this;
  }

  /**
   * The binary content to be received by the message consumer.
   *
   * Content will be stored in base64 in the resulting pact file.
   *
   * @param {Buffer} content - A buffer containing the binary content
   * @param {String} contenttype - The mime type of the content to expect
   * @returns {Message} MessageConsumer
   */
  public withBinaryContent(
    content: Buffer,
    contentType: string
  ): MessageConsumerPact {
    this.message.withBinaryContents(content, contentType);
    this.state.contentType = ContentType.BINARY;

    return this;
  }

  /**
   * Message metadata.
   *
   * @param {string} metadata -
   * @returns {Message} MessageConsumer
   */
  public withMetadata(metadata: Metadata): MessageConsumerPact {
    if (isEmpty(metadata)) {
      throw new ConfigurationError(
        'You must provide valid metadata for the Message, or none at all'
      );
    }

    forEachObjIndexed((v, k) => {
      this.message.withMetadata(
        `${k}`,
        typeof v === 'string' ? v : v.getValue()
      );
    }, metadata);

    return this;
  }

  /**
   * Creates a new Pact _message_ interaction to build a testable interaction.
   *
   * @param handler A message handler, that must be able to consume the given Message
   * @returns {Promise}
   */
  public verify(handler: MessageConsumer): Promise<unknown> {
    logger.info('Verifying message');

    return handler(this.reifiedContent())
      .then(() => {
        this.pact.writePactFile(
          this.config.dir ?? DEFAULT_PACT_DIR,
          this.config.pactfileWriteMode === 'overwrite'
        );
      })
      .finally(() => {
        this.message = this.pact.newMessage('');
        this.state = {};
      });
  }

  private reifiedContent(): ConcreteMessage {
    const raw = this.message.reifyMessage();
    logger.debug(`reified message raw: raw`);

    const reified: ConcreteMessage = JSON.parse(raw);

    if (this.state.contentType === ContentType.BINARY) {
      reified.contents = Buffer.from(reified.contents as string, 'base64');
    }

    logger.debug(
      `rehydrated message body into correct type: ${reified.contents}`
    );

    return reified;
  }

  /**
   * Returns the Message object created.
   *
   * @returns {Message}
   */
  public json(): Message {
    return this.state as Message;
  }
}

// TODO: create more basic adapters for API handlers

// bodyHandler takes a synchronous function and returns
// a wrapped function that accepts a Message and returns a Promise
export function synchronousBodyHandler<R>(
  handler: (body: AnyJson | Buffer) => R
): MessageConsumer {
  return (m: ConcreteMessage): Promise<R> => {
    const body = m.contents;

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
// TODO: move this into its own package and re-export?
export function asynchronousBodyHandler<R>(
  handler: (body: AnyJson | Buffer) => Promise<R>
): MessageConsumer {
  return (m: ConcreteMessage) => handler(m.contents);
}
