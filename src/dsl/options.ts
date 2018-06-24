/**
 * Pact Options module.
 * @module PactOptions
 */
import { PactfileWriteMode } from "./mockService";

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
  logLevel?: "trace" | "debug" | "info" | "error" | "fatal" | "warn" | undefined;

  // Pact specification version (defaults to 2)
  spec?: number;

  // Allow CORS OPTION requests to be accepted, defaults to false
  cors?: boolean;

  // Control how the Pact files are written
  // (defaults to 'overwrite')
  pactfileWriteMode?: PactfileWriteMode;
}

export interface MandatoryPactOptions {
  port: number;
  host: string;
  ssl: boolean;
}

export type PactOptionsComplete = PactOptions & MandatoryPactOptions;
