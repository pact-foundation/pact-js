import { JsonMap } from '../../common/jsonTypes';
import {
  Path,
  SpecificationVersion,
  TemplateHeaders,
  TemplateQuery,
  V3MockServer,
  V3ProviderState,
  V3Request,
  V3Response,
} from 'v3';
import { AnyTemplate } from '../../v3/matchers';

// TODO: do we alias all types to V4 or is this yicky??
//       These types are all interface types, so any extensions/modifications
//       could easily be made compatible
export type V4ProviderState = V3ProviderState;
export type V4MockServer = V3MockServer;
export type V4Request = V3Request;
export type V4Response = V3Response;

export interface PactV4Options {
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
   * Port to run the mock server on. Defaults to a random port
   */
  port?: number;
  /**
   * Specification version to use. Defaults to V4
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

export interface V4UnconfiguredInteraction {
  given(state: string, parameters?: JsonMap): V4UnconfiguredInteraction;
  uponReceiving(description: string): V4UnconfiguredInteraction;
  withCompleteRequest(request: V4Request): V4InteractionWithCompleteRequest;
  withRequest(
    method: string,
    path: Path,
    builder?: V4RequestBuilderFunc
  ): V4InteractionwithRequest;
  usingPlugin(config: PluginConfig): V4InteractionWithPlugin;
}

export interface V4InteractionWithCompleteRequest {
  withCompleteResponse(response: V4Response): V4InteractionWithResponse;
}

export interface V4InteractionwithRequest {
  willRespondWith(
    status: number,
    builder?: V4ResponseBuilderFunc
  ): V4InteractionWithResponse;
}

export type V4RequestBuilderFunc = (builder: V4RequestBuilder) => void;

// TOOD: not sure if the Builder pattern is better or worse from a readibility
//       and forcing function.
export interface V4RequestBuilder {
  query(query: TemplateQuery): V4RequestBuilder;
  headers(headers: TemplateHeaders): V4RequestBuilder;
  jsonBody(body: AnyTemplate): V4RequestBuilder;
  binaryFile(contentType: string, file: string): V4RequestBuilder;
  multipartBody(
    contentType: string,
    filename: string,
    mimePartName: string
  ): V4RequestBuilder;
  body(contentType: string, body: Buffer): V4RequestBuilder;
}

export interface V4ResponseBuilder {
  headers(headers: TemplateHeaders): V4ResponseBuilder;
  jsonBody(body: AnyTemplate): V4ResponseBuilder;
  binaryFile(contentType: string, file: string): V4ResponseBuilder;
  multipartBody(
    contentType: string,
    filename: string,
    mimePartName: string
  ): V4ResponseBuilder;
  body(contentType: string, body: Buffer): V4ResponseBuilder;
}

export type V4ResponseBuilderFunc = (builder: V4ResponseBuilder) => void;

export interface V4InteractionWithResponse {
  executeTest<T>(
    testFn: (mockServer: V4MockServer) => Promise<T>
  ): Promise<T | undefined>;
}

export type V4PluginRequestBuilderFunc = (
  builder: V4RequestWithPluginBuilder
) => void;
export type V4PluginResponseBuilderFunc = (
  builder: V4ResponseWithPluginBuilder
) => void;

export interface PluginConfig {
  plugin: string;
  version: string;
}

export interface V4InteractionWithPlugin {
  // Multiple plugins are allowed
  usingPlugin(config: PluginConfig): V4InteractionWithPlugin;
  withRequest(
    method: string,
    path: Path,
    builder?: V4PluginRequestBuilderFunc
  ): V4InteractionWithPluginRequest;
}

export interface V4InteractionWithPluginRequest {
  willRespondWith(
    status: number,
    builder?: V4PluginResponseBuilderFunc
  ): V4InteractionWithPluginResponse;
}

export interface V4RequestWithPluginBuilder {
  query(query: TemplateQuery): V4RequestWithPluginBuilder;
  headers(headers: TemplateHeaders): V4RequestWithPluginBuilder;
  jsonBody(body: AnyTemplate): V4RequestWithPluginBuilder;
  binaryFile(contentType: string, file: string): V4RequestWithPluginBuilder;
  multipartBody(
    contentType: string,
    filename: string,
    mimePartName: string
  ): V4RequestWithPluginBuilder;
  body(contentType: string, body: Buffer): V4RequestWithPluginBuilder;
  pluginContents(
    contentType: string,
    contents: string
  ): V4RequestWithPluginBuilder;
}

export interface V4ResponseWithPluginBuilder {
  headers(headers: TemplateHeaders): V4ResponseBuilder;
  jsonBody(body: AnyTemplate): V4ResponseBuilder;
  binaryFile(contentType: string, file: string): V4ResponseBuilder;
  multipartBody(
    contentType: string,
    filename: string,
    mimePartName: string
  ): V4ResponseBuilder;
  body(contentType: string, body: Buffer): V4ResponseBuilder;
  pluginContents(contentType: string, contents: string): V4ResponseBuilder;
}

export interface V4InteractionWithPluginResponse {
  executeTest<T>(
    testFn: (mockServer: V4MockServer) => Promise<T>
  ): Promise<T | undefined>;
}

export type TestFunction<T> = (mockServer: V4MockServer) => Promise<T>;
