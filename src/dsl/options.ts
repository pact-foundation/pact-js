/**
 * Pact Options module.
 * @module PactV2Options
 */
import { VerifierOptions as PactCoreVerifierOptions } from '@pact-foundation/pact-core';
import { PactfileWriteMode } from './mockService';
import { MessageProviders, MessageStateHandlers } from './message';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface PactV2Options {
  // The name of the consumer
  consumer: string;

  // The name of the provider
  provider: string;

  // The port to run the mock service on, defaults to 1234
  port?: number;

  // The host to run the mock service, defaults to 127.0.0.1
  host?: string;

  // SSL flag to identify the protocol to be used (default false, HTTP)
  ssl?: boolean;

  // Path to SSL certificate to serve on the mock service
  sslcert?: string;

  // Path to SSL key to serve on the mock service
  sslkey?: string;

  // Directory to output pact files
  dir?: string;

  // Directory to log to
  log?: string;

  // Log level
  logLevel?: LogLevel;

  // Pact specification version (defaults to 2)
  spec?: number;

  // Allow CORS OPTION requests to be accepted, defaults to false
  cors?: boolean;

  // How long to wait for the server to start before timing out
  timeout?: number;

  // Control how the Pact files are written
  // (defaults to 'overwrite')
  pactfileWriteMode?: PactfileWriteMode;
}

export interface MandatoryPactV2Options {
  port: number;
  host: string;
  ssl: boolean;
}

export type PactV2OptionsComplete = PactV2Options & MandatoryPactV2Options;

export interface MessageProviderOptions {
  // Log level
  logLevel?: LogLevel;

  // Message providers
  messageProviders: MessageProviders;

  // Prepare any provider states
  stateHandlers?: MessageStateHandlers;
}

type ExcludedPactNodeVerifierKeys = Exclude<
  keyof PactCoreVerifierOptions,
  'providerBaseUrl'
>;
export type PactNodeVerificationExcludedOptions = Pick<
  PactCoreVerifierOptions,
  ExcludedPactNodeVerifierKeys
>;

export type PactMessageProviderOptions = PactNodeVerificationExcludedOptions &
  MessageProviderOptions;

export interface MessageConsumerOptions {
  // The name of the consumer
  consumer: string;

  // Directory to output pact files
  dir?: string;

  // The name of the provider
  provider: string;

  // Directory to log to
  log?: string;

  // Log level
  logLevel?: LogLevel;

  // Specification Version (should be 3 or greater for messages)
  spec?: number;

  // Control how the Pact files are written
  // Choices: 'overwrite' | 'update', 'none', defaults to 'overwrite'
  pactfileWriteMode?: PactfileWriteMode;
}
