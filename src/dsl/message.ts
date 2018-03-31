
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
  providerState?: string;
  description?: string;
  metadata?: Metadata;
  content: any;
}
