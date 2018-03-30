import { MatcherResult } from "./matchers";

export interface Metadata { [name: string]: string | MatcherResult; }

export interface Message {
  providerState?: string;
  description?: string;
  metadata?: Metadata;
  content: any;
}
