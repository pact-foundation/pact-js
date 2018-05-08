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

// Consumer message handler
export type MessageHandler = (m: Message) => Promise<any>;
export interface MessageHandlers { [name: string]: MessageHandler; }
export interface StateHandlers { [name: string]: (state: string) => Promise<any>; }
