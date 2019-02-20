import { MatcherResult } from "./matchers"

/**
 * Metadata is a map containing message context,
 * such as content-type, correlation IDs etc.
 *
 * @module Message
 */
export interface Metadata {
  [name: string]: string | MatcherResult
}

/**
 * A Message is an asynchronous Interaction, sent via a Provider
 *
 * @module Message
 */
export interface Message {
  providerStates?: [{ name: string }]
  description?: string
  metadata?: Metadata
  contents: any
}

/**
 * A Message Descriptor is a set of additional context for a given message
 *
 * @module Message
 */
export interface MessageDescriptor {
  providerStates?: [{ name: string }]
  description: string
  metadata?: Metadata
}

/**
 * A Message Consumer is a function that will receive a message
 * from a given Message Provider. It is given the full Message
 * context during verification.
 *
 * @module Message
 */
export type MessageConsumer = (m: Message) => Promise<any>

/**
 * A Message Provider is a function that will be invoked by the framework
 * in order to _produce_ a message for a consumer. The response must match what
 * the given consumer has specified in the pact file. It is given a Message
 * Descriptor object when being invoked which can be used for additional context.
 *
 * @module Message
 */
export type MessageProvider = (m: MessageDescriptor) => Promise<any>

export interface MessageProviders {
  [name: string]: MessageProvider
}

export interface StateHandlers {
  [name: string]: (state: string) => Promise<any>
}
