import { ProxyOptions, StateHandlers } from 'dsl/verifier/proxy/types';

import * as express from 'express';
import { ConsumerVersionSelector } from '@pact-foundation/pact-core';

import logger from '../common/logger';

import { Verifier } from '../dsl/verifier';

export interface VerifierV3Options {
  provider: string;
  logLevel: string;
  providerBaseUrl: string;
  pactUrls?: string[];
  pactBrokerUrl?: string;
  providerStatesSetupUrl?: string;
  pactBrokerUsername?: string;
  pactBrokerPassword?: string;
  pactBrokerToken?: string;
  // The timeout in milliseconds for state handlers and individuals
  // requests to execute within
  timeout?: number;
  publishVerificationResult?: boolean;
  providerVersion?: string;
  requestFilter?: express.RequestHandler;
  stateHandlers?: StateHandlers;
  consumerVersionTags?: string | string[];
  providerVersionTags?: string | string[];
  consumerVersionSelectors?: ConsumerVersionSelector[];
  enablePending?: boolean;
  includeWipPactsSince?: string;
  disableSSLVerification?: boolean;
}

export { ConsumerVersionSelector };

export type VerifierOptions = VerifierV3Options & ProxyOptions;
export class VerifierV3 {
  private internalVerifier: Verifier;

  constructor(config: VerifierOptions) {
    this.internalVerifier = new Verifier(config);
  }

  /**
   * Verify a HTTP Provider
   */
  public verifyProvider(): Promise<unknown> {
    logger.warn(
      'You no longer need to import the verifier from @pact-foundation/pact/v3'
    );
    logger.warn(
      " - you may now update your imports to import { Verifier } from '@pact-foundation/pact'"
    );
    return this.internalVerifier.verifyProvider();
  }
}
