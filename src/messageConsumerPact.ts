/**
 * @module Message
 */

import { isEmpty, cloneDeep } from "lodash"
import { extractPayload } from "./dsl/matchers"
import { qToPromise } from "./common/utils"
import {
  Metadata,
  Message,
  MessageProvider,
  MessageConsumer,
} from "./dsl/message"
import logger from "./common/logger"
import serviceFactory from "@pact-foundation/pact-node"
import { MessageConsumerOptions } from "./dsl/options"
import ConfigurationError from "./errors/configurationError"
import { LogLevels } from "@pact-foundation/pact-node/src/logger"

interface PactNodeFactory {
  createMessage(opts: any): any
}
/**
 * A Message Consumer is analagous to a Provider in the HTTP Interaction model.
 * It is the receiver of an interaction, and needs to be able to handle whatever
 * request was provided.
 */
export class MessageConsumerPact {
  // Build up a valid Message object
  private state: any = {}

  constructor(private config: MessageConsumerOptions) {
    if (!isEmpty(config.logLevel)) {
      logger.level(config.logLevel as LogLevels)
      serviceFactory.logLevel(config.logLevel)
    }
  }

  /**
   * Gives a state the provider should be in for this Message.
   *
   * @param {string} providerState - The state of the provider.
   * @returns {Message} MessageConsumer
   */
  public given(providerState: string) {
    if (providerState) {
      // Currently only supports a single state
      // but the format needs to be v3 compatible for
      // basic interoperability
      this.state.providerStates = [
        {
          name: providerState,
        },
      ]
    }

    return this
  }

  /**
   * A free style description of the Message.
   *
   * @param {string} description - A description of the Message to be received
   * @returns {Message} MessageConsumer
   */
  public expectsToReceive(description: string) {
    if (isEmpty(description)) {
      throw new ConfigurationError(
        "You must provide a description for the Message."
      )
    }
    this.state.description = description

    return this
  }

  /**
   * The content to be received by the message consumer.
   *
   * May be a JSON document or JSON primitive.
   *
   * @param {string} content - A description of the Message to be received
   * @returns {Message} MessageConsumer
   */
  public withContent(content: any) {
    if (isEmpty(content)) {
      throw new ConfigurationError(
        "You must provide a valid JSON document or primitive for the Message."
      )
    }
    this.state.contents = content

    return this
  }

  /**
   * Message metadata
   *
   * @param {string} metadata -
   * @returns {Message} MessageConsumer
   */
  public withMetadata(metadata: Metadata) {
    if (isEmpty(metadata)) {
      throw new ConfigurationError(
        "You must provide valid metadata for the Message, or none at all"
      )
    }
    this.state.metadata = metadata

    return this
  }

  /**
   * Returns the Message object created.
   *
   * @returns {Message}
   */
  public json(): Message {
    return this.state as Message
  }

  /**
   * Creates a new Pact _message_ interaction to build a testable interaction.
   *
   * @param handler A message handler, that must be able to consume the given Message
   * @returns {Promise}
   */
  public verify(handler: MessageConsumer): Promise<any> {
    logger.info("Verifying message")

    return this.validate()
      .then(() => handler(extractPayload(cloneDeep(this.state))))
      .then(() =>
        qToPromise<string>(
          this.getServiceFactory().createMessage({
            consumer: this.config.consumer,
            content: JSON.stringify(this.state),
            dir: this.config.dir,
            pactFileWriteMode: this.config.pactfileWriteMode,
            provider: this.config.provider,
            spec: 3,
          })
        )
      )
  }

  /**
   * Validates the current state of the Message.
   *
   * @returns {Promise}
   */
  public validate(): Promise<any> {
    if (isMessage(this.state)) {
      return Promise.resolve()
    }
    return Promise.reject("message has not yet been properly constructed")
  }

  private getServiceFactory(): PactNodeFactory {
    return serviceFactory
  }
}

const isMessage = (x: Message | any): x is Message => {
  return (x as Message).contents !== undefined
}

// TODO: create more basic adapters for API handlers

// bodyHandler takes a synchronous function and returns
// a wrapped function that accepts a Message and returns a Promise
export function synchronousBodyHandler(
  handler: (body: any) => any
): MessageConsumer {
  return (m: Message): Promise<any> => {
    const body = m.contents

    return new Promise((resolve, reject) => {
      try {
        const res = handler(body)
        resolve(res)
      } catch (e) {
        reject(e)
      }
    })
  }
}

// bodyHandler takes an asynchronous (promisified) function and returns
// a wrapped function that accepts a Message and returns a Promise
// TODO: move this into its own package and re-export?
export function asynchronousBodyHandler(
  handler: (body: any) => Promise<any>
): MessageConsumer {
  return (m: Message) => handler(m.contents)
}
