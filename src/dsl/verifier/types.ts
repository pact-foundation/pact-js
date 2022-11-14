import { VerifierOptions as PactCoreVerifierOptions } from '@pact-foundation/pact-core';
import { MessageProviderOptions } from '../options';

import { ProxyOptions } from './proxy/types';

type ExcludedPactNodeVerifierKeys = Exclude<
  keyof PactCoreVerifierOptions,
  'providerBaseUrl'
>;

export type PactNodeVerificationExcludedOptions = Pick<
  PactCoreVerifierOptions,
  ExcludedPactNodeVerifierKeys
>;

export type VerifierOptions = PactNodeVerificationExcludedOptions &
  ProxyOptions &
  Partial<MessageProviderOptions>;
