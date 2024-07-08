import { AnyJson, JsonMap } from '../../common/jsonTypes';
import { Metadata } from '../../dsl/message';

export type MessageContents = unknown; // TODO { contents: Buffer }

// TODO: this is currently an empty object,
//       it will eventually be populated with a Buffer
//       for the request and response body
export interface SynchronousMessage {
  Request: MessageContents;
  Response: MessageContents[];
}

// TODO: this is currently an empty object,
//       it will eventually be populated with a Buffer
export interface AsynchronousMessage {
  contents: MessageContents;
  // metadata: Metadata
}

export interface PluginConfig {
  plugin: string;
  version: string;
}

export interface TransportConfig {
  port: number;
  address: string;
}

export type V4AsynchronousMessageBuilderFunc = (
  builder: V4AsynchronousMessageBuilder
) => void;

export type V4MessageRequestBuilderFunc = (
  builder: V4SynchronousMessageWithRequestBuilder
) => void;

export type V4MessageResponseBuilderFunc = (
  builder: V4SynchronousMessageWithResponseBuilder
) => void;

export interface V4SynchronousPact {
  addSynchronousMessage(description: string): V4UnconfiguredSynchronousMessage;
}

export interface V4UnconfiguredSynchronousMessage {
  given(state: string, parameters?: JsonMap): V4UnconfiguredSynchronousMessage;
  usingPlugin(config: PluginConfig): V4SynchronousMessageWithPlugin;
  withRequest(r: V4MessageRequestBuilderFunc): V4SynchronousMessageWithRequest;
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
  withJSONContent(content: unknown): V4SynchronousMessageWithRequestBuilder;
}

export interface V4SynchronousMessageWithRequest {
  withResponse(
    builder: V4MessageResponseBuilderFunc
  ): V4SynchronousMessageWithResponse;
}

export interface V4SynchronousMessageWithResponseBuilder {
  withMetadata(metadata: Metadata): V4SynchronousMessageWithResponseBuilder;
  withContent(
    contentType: string,
    body: Buffer
  ): V4SynchronousMessageWithResponseBuilder;
  withJSONContent(content: unknown): V4SynchronousMessageWithResponseBuilder;
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

export interface V4UnconfiguredAsynchronousMessage {
  given(state: string, parameters?: JsonMap): V4UnconfiguredAsynchronousMessage;
  usingPlugin(config: PluginConfig): V4AsynchronousMessageWithPlugin;
  expectsToReceive(
    description: string,
    contents: V4AsynchronousMessageBuilderFunc
  ): V4AsynchronousMessageWithContent;
}

export interface V4AsynchronousMessageWithPlugin {
  usingPlugin(config: PluginConfig): V4AsynchronousMessageWithPlugin;
  expectsToReceive(description: string): V4AsynchronousMessageWithPlugin;
  withPluginContents(
    contents: string,
    contentType: string
  ): V4AsynchronousMessageWithPluginContents;
}

export interface V4AsynchronousMessageWithPluginContents {
  executeTest<T>(
    integrationTest: (m: AsynchronousMessage) => Promise<T>
  ): Promise<T | undefined>;
  startTransport(
    transport: string,
    address: string,
    config?: AnyJson
  ): V4AsynchronousMessageWithTransport;
}

export interface V4AsynchronousMessageWithTransport {
  executeTest<T>(
    integrationTest: (tc: TransportConfig, m: AsynchronousMessage) => Promise<T>
  ): Promise<T | undefined>;
}

export interface V4AsynchronousMessageWithContent {
  executeTest<T>(
    integrationTest: (m: AsynchronousMessage) => Promise<T>
  ): Promise<T | undefined>;
}

export interface V4AsynchronousMessageBuilder {
  withMetadata(metadata: Metadata): V4AsynchronousMessageBuilder;
  withContent(contentType: string, body: Buffer): V4AsynchronousMessageBuilder;
  withJSONContent(content: unknown): V4AsynchronousMessageBuilder;
}
