import express from 'express';
import { LogLevel } from '../../options';

export interface StateHandler {
  [name: string]: () => Promise<unknown>;
}

export interface ProviderState {
  states?: [string];
}

export type Hook = () => Promise<unknown>;

export interface ProxyOptions {
  logLevel?: LogLevel;
  requestFilter?: express.RequestHandler;
  stateHandlers?: StateHandler;
  beforeEach?: Hook;
  afterEach?: Hook;
  validateSSL?: boolean;
  changeOrigin?: boolean;
  providerBaseUrl: string;
}
