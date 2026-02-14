import { JsonMap } from '../common/jsonTypes';

export enum SpecificationVersion {
  SPECIFICATION_VERSION_V2 = 3,
  SPECIFICATION_VERSION_V3 = 4,
  SPECIFICATION_VERSION_V4 = 5,
}

/**
 * Pact Matcher
 */
export interface Matcher<T> {
  'pact:matcher:type': string;
  'pact:generator:type'?: string; // In the future, we should split out generator from matchers (they are different things)
  value?: T | Record<string, T>;
}

export interface V3RegexMatcher extends Matcher<string> {
  regex: string;
  example?: string;
}

/**
 * Like Matcher with a minimum number of required values
 */
export interface MinLikeMatcher<T> extends Matcher<T> {
  min: number;
}

/**
 * Like Matcher with a maximum number of required values
 */
export interface MaxLikeMatcher<T> extends Matcher<T> {
  max: number;
}

export interface DateTimeMatcher extends Matcher<string> {
  format: string;
}

export interface ArrayContainsMatcher extends Matcher<unknown[]> {
  variants: Array<unknown>;
}

export interface ProviderStateInjectedValue<T> extends Matcher<T> {
  expression: string;
}

export interface RulesMatcher<T> extends Matcher<T> {
  rules: Matcher<T>[];
}

/**
 * Part of a request or response where matching rules can be applied
 */
export type Part = 'path' | 'body' | 'header' | 'query' | 'status';

export type JSONPath = string;

/**
 * A matching rule with optional JSONPath and array of matchers
 */
export type Rule = {
  path?: JSONPath;
  rules: Matcher<unknown>[];
};

/**
 * Matching rules organized by part (path, body, header, query, status)
 * Each part can have its own set of matching rules
 */
export type Rules = Partial<{
  [part in Part]: Rule | Rule[];
}>;

/**
 * Options for the mock server
 */
export interface PactV3Options {
  /**
   * Directory to write the pact file to
   */
  dir?: string;
  /**
   * Consumer name
   */
  consumer: string;
  /**
   * Provider name
   */
  provider: string;
  /**
   * If the mock server should handle CORS pre-flight requests. Defaults to false
   */
  cors?: boolean;
  /**
   * Port to run the mock server on. Defaults to a random port
   */
  port?: number;
  /**
   * Specification version to use
   */
  spec?: SpecificationVersion;
  /**
   * Specification version to use
   */
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  /**
   * Flag to identify if HTTP or HTTPs over TLS should be used (default false, HTTP)
   */
  tls?: boolean;
  /**
   * The host to run the mock service, defaults to 127.0.0.1
   */
  host?: string;
}

export interface V3ProviderState {
  description: string;
  parameters?: JsonMap;
}

export declare type TemplateHeaders = {
  [header: string]: string | Matcher<string> | (Matcher<string> | string)[];
};

export type TemplateQuery = Record<
  string,
  | string
  | Matcher<string | number | boolean>
  | Array<string | Matcher<string | number | boolean>>
>;

export interface V3Interaction {
  states?: V3ProviderState[];
  uponReceiving: string;
  withRequest: V3Request;
  willRespondWith: V3Response;
}

export type Path = string | Matcher<string>;

export interface V3Request {
  method: string;
  path: Path;
  query?: TemplateQuery;
  headers?: TemplateHeaders;
  body?: unknown;
  contentType?: string;
}

export interface V3Response {
  status: number;
  headers?: TemplateHeaders;
  body?: unknown;
  contentType?: string;
}

export interface V3MockServer {
  port: number;
  url: string;
  id: string;
}
