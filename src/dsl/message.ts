import { MatcherResult } from "./matchers";

/**
 * Metadata is a map containing message context,
 * such as content-type etc.
 *
 * @module Message
 */
export interface Metadata { [name: string]: string | MatcherResult; }

/**
 * A Message is an asynchronous Interaction, sent via a Provider
 * (consumer in the http, synchronous interaction parlance)
 *
 * @module Message
 */
export interface Message {
  providerStates?: [{ name: string }];
  description?: string;
  metadata?: Metadata;
  contents: any;
}

// Message producer/handlers
export type MessageConsumer = (m: Message) => Promise<any>;
export type MessageProvider = (m: Message) => Promise<any>;
export interface MessageProviders { [name: string]: MessageProvider; }
export interface StateHandlers { [name: string]: (state: string) => Promise<any>; }
