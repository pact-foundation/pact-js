import * as express from 'express';
import { ConsumerVersionSelector } from '@pact-foundation/pact-core';

import logger from '../common/logger';
import { ProxyOptions, StateHandlers } from '../dsl/verifier/proxy/types';
import { Verifier } from '../dsl/verifier';

export interface VerifierV3OptionsInternal {
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

export type VerifierV3Options = VerifierV3OptionsInternal & ProxyOptions;
export class VerifierV3 {
  private internalVerifier: Verifier;

  private config: VerifierV3Options;

  constructor(config: VerifierV3Options) {
    this.config = config;
    this.internalVerifier = new Verifier({
      ...config,
      // Casing has changed for this option
      disableSslVerification: config.disableSSLVerification,
    });
  }

  /**
   * Verify a HTTP Provider
   */
  public verifyProvider(): Promise<unknown> {
    logger.warn(
      `VerifierV3 is now deprecated
      
  You no longer need to import the verifier from @pact-foundation/pact/v3
  You may now update your imports to:

      import { Verifier } from '@pact-foundation/pact'
      
  Thank you for being part of pact-js beta!`
    );

    if (this.config.disableSSLVerification) {
      logger.warn(
        'When migrating from VerifierV3, you will need to change disableSSLVerification to disableSslVerification'
      );
    }
    return this.internalVerifier.verifyProvider();
  }
}
