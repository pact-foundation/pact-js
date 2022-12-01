import * as MatchersV3 from './matchers';
import { JsonMap } from '../common/jsonTypes';

// eslint-disable-next-line no-shadow
export enum SpecificationVersion {
  SPECIFICATION_VERSION_V2 = 3,
  SPECIFICATION_VERSION_V3 = 4,
  SPECIFICATION_VERSION_V4 = 5,
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
  [header: string]:
    | string
    | MatchersV3.Matcher<string>
    | (MatchersV3.Matcher<string> | string)[];
};

export type TemplateQuery = Record<
  string,
  | string
  | MatchersV3.Matcher<string>
  | Array<string | MatchersV3.Matcher<string>>
>;

export interface V3Interaction {
  states?: V3ProviderState[];
  uponReceiving: string;
  withRequest: V3Request;
  willRespondWith: V3Response;
}

export type Path = string | MatchersV3.Matcher<string>;
export interface V3Request {
  method: string;
  path: Path;
  query?: TemplateQuery;
  headers?: TemplateHeaders;
  body?: MatchersV3.AnyTemplate;
  contentType?: string;
}

export interface V3Response {
  status: number;
  headers?: TemplateHeaders;
  body?: MatchersV3.AnyTemplate;
  contentType?: string;
}

export interface V3MockServer {
  port: number;
  url: string;
  id: string;
}
