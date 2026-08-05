import type express from 'express';
import type { SecureContextOptions } from 'node:tls';
import type { AnyJson, JsonMap } from '../../../common/jsonTypes';
import type { MessageProviders } from '../../message';
import type { LogLevel } from '../../options';

export type Hook = () => Promise<unknown>;

/**
 * State handlers map a state description to a function
 * that can setup the provider state
 */
export interface StateHandlers {
  [name: string]: StateHandler;
}
/**
 * Incoming provider state request
 */
export interface ProviderState {
  action: StateAction;
  params: JsonMap;
  state: string;
}

/**
 * Specifies whether the state handler being setup or shutdown
 */
export type StateAction = 'setup' | 'teardown';

/**
 * Respond to the state setup event, optionally returning a map of provider
 * values to dynamically inject into the incoming request to test
 */
// biome-ignore lint/suspicious/noConfusingVoidType: state handlers may intentionally resolve without a value.
export type StateFunc = (parameters?: AnyJson) => Promise<JsonMap | void>;

/**
 * Respond to the state setup event, with the ability to hook into the setup/teardown
 * phase of the state
 */
export type StateFuncWithSetup = {
  setup?: StateFunc;
  teardown?: StateFunc;
};

export type StateHandler = StateFuncWithSetup | StateFunc;

export interface ProxyOptions {
  logLevel?: LogLevel;
  requestFilter?: express.RequestHandler;
  stateHandlers?: StateHandlers;
  messageProviders?: MessageProviders;
  beforeEach?: Hook;
  afterEach?: Hook;
  validateSSL?: boolean;
  tlsClientOptions?: Pick<
    SecureContextOptions,
    'cert' | 'key' | 'passphrase' | 'pfx'
  >;
  changeOrigin?: boolean;
  providerBaseUrl?: string;
  proxyHost?: string;
}
