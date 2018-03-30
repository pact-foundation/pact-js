/**
 * A Message is an asynchronous Interaction, sent via a Producer
 * (consumer in the http, synchronous interaction parlance)
 * @module Message
 */

import { isNil } from "lodash";
import { MatcherResult } from "./dsl/matchers";
import { qToPromise } from "./common/utils";
import { Metadata, Message } from "./dsl/message";
import { logger } from "./common/logger";
import serviceFactory from "@pact-foundation/pact-node";
import { MessageConsumerOptions } from "./dsl/options";

export class MessageConsumer {
  private state: any = {};

  constructor(private config: MessageConsumerOptions) { }

  /**
   * Gives a state the provider should be in for this Message.
   *
   * @param {string} providerState - The state of the provider.
   * @returns {Message} Message
   */
  public given(providerState: string) {
    if (providerState) {
      this.state.providerState = providerState;
    }

    return this;
  }

  /**
   * A free style description of the Message.
   *
   * @param {string} description - A description of the Message to be received
   * @returns {Message} Message
   */
  public expectsToReceive(description: string) {
    if (isNil(description)) {
      throw new Error("You must provide a description for the Message.");
    }
    this.state.description = description;

    return this;
  }

  /**
   * The content to be received by the message consumer.
   *
   * May be a JSON document or JSON primitive.
   *
   * @param {string} content - A description of the Message to be received
   * @returns {Message} Message
   */
  public withContent(content: any) {
    if (isNil(content)) {
      throw new Error("You must provide a valid JSON document or primitive for the Message.");
    }
    this.state.content = content;

    return this;
  }

  /**
   * Message metadata
   *
   * @param {string} metadata -
   * @returns {Message} Message
   */
  public withMetadata(metadata: Metadata) {
    if (isNil(metadata)) {
      throw new Error("You must provide valid metadata for the Message, or none at all");
    }
    this.state.metadata = metadata;

    return this;
  }

  /**
   * Returns the Message object created.
   * @returns {Object}
   */
  public json(): Message {
    return this.state as Message;
  }

  // VerifyMessageConsumer creates a new Pact _message_ interaction to build a testable
  // interaction
  //
  // A Message Consumer is analagous to a Provider in the HTTP Interaction model.
  // It is the receiver of an interaction, and needs to be able to handle whatever
  // request was provided.

  // TODO: should we just throw here rather than return a promise?
  //       Not sure what is most idiomatic, but we don't want any
  public verify(handler: (m: Message) => Promise<any>): Promise<any> {
    logger.info("Verifying message");

    return handler(this.state)
      .then(() => qToPromise<string>(serviceFactory.createMessage({
        consumer: this.config.consumer,
        content: JSON.stringify(this.state),
        dir: this.config.dir,
        pactFileWriteMode: this.config.pactfileWriteMode,
        provider: this.config.provider,
      })));
  }
}
