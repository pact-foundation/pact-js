/**
 * Pact Options module.
 * @module PactOptions
 */
import { PactfileWriteMode } from "./mockService";
import { MessageHandlers, StateHandlers } from "pact";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

// TODO: Combine types here to reduce duplication
export interface PactOptions {
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

  // Control how the Pact files are written
  // Choices: 'overwrite' | 'update', 'none', defaults to 'overwrite'
  pactfileWriteMode?: PactfileWriteMode;
}

export interface MandatoryPactOptions {
  port: number;
  host: string;
  ssl: boolean;
}

export type PactOptionsComplete = PactOptions & MandatoryPactOptions;
// export interface MessageHandlers { [name: string]: (m: Message) => Promise<any>; }
// export interface StateHandlers { [name: string]: (m: Message) => Promise<any>; }

export interface MessageProviderOptions {
  // The name of the consumer
  consumer: string;

  // The name of the provider
  provider: string;

  providerVersion?: string;

  // Pacts to Verify
  pactUrls?: string[];
  // pactFilesOrDirs?: string[];

  // Directory to log to
  log?: string;

  // Log level
  logLevel?: LogLevel;

  // Message providers
  handlers: MessageHandlers;

  // Prepare any provider states
  stateHandlers?: StateHandlers;

  // Choices: 'overwrite' | 'update', 'none', defaults to 'overwrite'
  pactfileWriteMode?: PactfileWriteMode;

  providerStatesSetupUrl?: string;
  pactBrokerUsername?: string;
  pactBrokerPassword?: string;
  customProviderHeaders?: string[];
  publishVerificationResult?: boolean;
  pactBrokerUrl?: string;
  tags?: string[];
  timeout?: number;
}
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

  // Specification Version (should be 3 for messages)
  spec?: number;

  // Control how the Pact files are written
  // Choices: 'overwrite' | 'update', 'none', defaults to 'overwrite'
  pactfileWriteMode?: PactfileWriteMode;
}
