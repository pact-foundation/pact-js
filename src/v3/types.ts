import { AnyJson, JsonMap } from '../common/jsonTypes';

export enum SpecificationVersion {
  SPECIFICATION_VERSION_V2 = 3,
  SPECIFICATION_VERSION_V3 = 4,
  SPECIFICATION_VERSION_V4 = 5,
}

interface TemplateMap {
  [key: string]: AnyJson | AnyTemplate;
}
type TemplateArray = Array<AnyTemplate>;

/**
 * The `AnyTemplate` type is no longer used anywhere in Pact.
 *
 * @deprecated This type never really worked, so it has been removed from the Pact API surface. It is still exported to avoid breaking changes with anyone who is importing it. See {@link https://github.com/pact-foundation/pact-js/issues/1054} for details
 */
export type AnyTemplate =
  | AnyJson
  | TemplateMap
  | TemplateArray
  | Matcher<unknown>;

// TODO: In the next major release, these types should be renamed so they
// don't clash with the V2 ones. Typescript merges interfaces with the same
// name, so the calculated type for any Matcher that exists in both V2 and
// V3 will be wrong. This isn't a major problem as is only likely to affect
// maintainers, and contributors but it definitely should be corrected.

/**
 * Pact Matcher
 */
export interface Matcher<T> {
  'pact:matcher:type': string;
  'pact:generator:type'?: string;
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
