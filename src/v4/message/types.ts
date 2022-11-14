import { AnyJson, JsonMap } from '../../common/jsonTypes';
import { Metadata } from '../../dsl/message';
import { AnyTemplate } from '../../v3/matchers';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessageContents {
  // contents: Buffer // TODO
}

// TODO: this is currently an empty object,
//       it will eventually be populated with a Buffer
//       for the request and response body
export interface SynchronousMessage {
  Request: MessageContents;
  Response: MessageContents[];
}

export interface PluginConfig {
  plugin: string;
  version: string;
}

export interface TransportConfig {
  port: number;
  address: string;
}

export type V4MessagePluginRequestBuilderFunc = (
  builder: V4SynchronousMessageWithRequestBuilder
) => void;

export type V4MessagePluginResponseBuilderFunc = (
  builder: V4SynchronousMessageWithResponseBuilder
) => void;

export interface V4SynchronousPact {
  addSynchronousMessage(description: string): V4UnconfiguredSynchronousMessage;
}

export interface V4UnconfiguredSynchronousMessage {
  given(state: string, parameters?: JsonMap): V4UnconfiguredSynchronousMessage;
  usingPlugin(config: PluginConfig): V4SynchronousMessageWithPlugin;
  withRequest(
    r: V4MessagePluginRequestBuilderFunc
  ): V4SynchronousMessageWithRequest;
}

// TODO: allow interface to accept non-plugin contents (req/response bodies)
//
export interface V4SynchronousMessageWithPlugin {
  usingPlugin(config: PluginConfig): V4SynchronousMessageWithPlugin;
  withPluginContents(
    contents: string,
    contentType: string
  ): V4SynchronousMessageWithPluginContents;
}

export interface V4Message {
  withMetadata(metadata: Metadata): V4Message;
}

export interface V4SynchronousMessageWithRequestBuilder {
  withContent(
    contentType: string,
    body: Buffer
  ): V4SynchronousMessageWithRequestBuilder;
  withJSONContent(content: AnyTemplate): V4SynchronousMessageWithRequestBuilder;
}

export interface V4SynchronousMessageWithRequest {
  withResponse(
    builder: V4MessagePluginResponseBuilderFunc
  ): V4SynchronousMessageWithResponse;
}

export interface V4SynchronousMessageWithResponseBuilder {
  withMetadata(metadata: Metadata): V4SynchronousMessageWithResponseBuilder;
  withContent(
    contentType: string,
    body: Buffer
  ): V4SynchronousMessageWithResponseBuilder;
  withJSONContent(
    content: AnyTemplate
  ): V4SynchronousMessageWithResponseBuilder;
}

export interface V4SynchronousMessageWithPluginContents {
  executeTest<T>(
    integrationTest: (m: SynchronousMessage) => Promise<T>
  ): Promise<T | undefined>;
  startTransport(
    transport: string,
    address: string,
    config?: AnyJson
  ): V4SynchronousMessageWithTransport;
}

export interface V4SynchronousMessageWithTransport {
  executeTest<T>(
    integrationTest: (tc: TransportConfig, m: SynchronousMessage) => Promise<T>
  ): Promise<T | undefined>;
}

export interface V4SynchronousMessageWithResponse {
  executeTest<T>(
    integrationTest: (m: SynchronousMessage) => Promise<T>
  ): Promise<T | undefined>;
}
