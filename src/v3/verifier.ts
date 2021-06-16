import { isEmpty } from 'ramda';
import express from 'express';
import ConfigurationError from '../errors/configurationError';
import logger from '../common/logger';

import PactNative from '../../native/index.node';

/**
 * Define needed state for given pacts
 */
export type StateHandler = (
  setup: boolean,
  parameters: Record<string, unknown>
) => void;

// Commented out fields highlight areas we need to look at for compatibility
// with existing API, as a sort of "TODO" list.
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

  /**
   * The timeout in milliseconds for request filters and provider state handlers
   * to execute within
   */
  callbackTimeout?: number;
  // customProviderHeaders?: string[]
  publishVerificationResult?: boolean;
  providerVersion?: string;
  requestFilter?: express.RequestHandler;
  stateHandlers?: Record<string, StateHandler>;

  consumerVersionTags?: string | string[];
  providerVersionTags?: string | string[];
  consumerVersionSelectors?: ConsumerVersionSelector[];
  enablePending?: boolean;
  // timeout?: number;
  // verbose?: boolean;
  includeWipPactsSince?: string;
  // out?: string;
  // logDir?: string;
  disableSSLVerification?: boolean;
}

export interface ConsumerVersionSelector {
  pacticipant?: string;
  tag?: string;
  version?: string;
  latest?: boolean;
  all?: boolean;
}

interface InternalVerifierOptions {
  consumerVersionSelectorsString?: string[];
}

export class VerifierV3 {
  private config: VerifierV3Options;

  constructor(config: VerifierV3Options) {
    this.config = config;
  }

  /**
   * Verify a HTTP Provider
   */
  public verifyProvider(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const config: VerifierV3Options & InternalVerifierOptions = {
        ...this.config,
      };

      if (isEmpty(this.config)) {
        reject(new ConfigurationError('No configuration provided to verifier'));
      }

      // This is just too messy to do on the rust side. neon-serde would have helped, but appears unmaintained
      // and is currently incompatible
      if (this.config.consumerVersionSelectors) {
        config.consumerVersionSelectorsString = this.config.consumerVersionSelectors.map(
          (s) => JSON.stringify(s)
        );
      }

      if (!this.config.provider) {
        reject(new ConfigurationError('Provider name is required'));
      }
      if (
        (isEmpty(this.config.pactUrls) || !this.config.pactUrls) &&
        !this.config.pactBrokerUrl
      ) {
        reject(
          new ConfigurationError(
            'Either a list of pactUrls or a pactBrokerUrl must be provided'
          )
        );
      }

      try {
        PactNative.verify_provider(this.config, (err, val) => {
          if (err || !val) {
            logger.debug('In verify_provider callback: FAILED with', err, val);
            reject(err);
          } else {
            logger.debug('In verify_provider callback: SUCCEEDED with', val);
            resolve(val);
          }
        });
        logger.debug('Submitted test to verify_provider');
      } catch (e) {
        reject(e);
      }
    });
  }
}
