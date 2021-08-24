import { isEmpty } from 'ramda';
import { ProxyOptions, StateHandlers } from 'dsl/verifier/proxy/types';

import * as express from 'express';
import * as http from 'http';
import * as url from 'url';
import { localAddresses } from '../common/net';
import { createProxy, waitForServerReady } from '../dsl/verifier/proxy';

import ConfigurationError from '../errors/configurationError';
import logger, { setLogLevel } from '../common/logger';

import * as PactNative from '../../native/index.node';

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

export type VerifierOptions = VerifierV3Options & ProxyOptions;
export class VerifierV3 {
  private config: VerifierOptions;

  private address = 'http://localhost';

  private stateSetupPath = '/_pactSetup';

  constructor(config: VerifierOptions) {
    this.config = config;
    this.validateConfiguration();
  }

  /**
   * Verify a HTTP Provider
   */
  public verifyProvider(): Promise<unknown> {
    // Start the verification CLI proxy server
    const server = createProxy(this.config, this.stateSetupPath);

    // Run the verification once the proxy server is available
    // and properly shut down the proxy before returning
    return waitForServerReady(server)
      .then(this.runProviderVerification())
      .then(
        (result: unknown) =>
          new Promise((resolve) => {
            server.close(() => {
              resolve(result);
            });
          })
      )
      .catch(
        (e: Error) =>
          new Promise((_, reject) => {
            server.close(() => {
              reject(e);
            });
          })
      );
  }

  private validateConfiguration() {
    const config: VerifierV3Options & InternalVerifierOptions = {
      ...this.config,
    };

    if (this.config.logLevel && !isEmpty(this.config.logLevel)) {
      setLogLevel(this.config.logLevel);
    }

    if (this.config.validateSSL === undefined) {
      this.config.validateSSL = true;
    }

    if (this.config.changeOrigin === undefined) {
      this.config.changeOrigin = false;

      if (!this.isLocalVerification()) {
        this.config.changeOrigin = true;
        logger.warn(
          `non-local provider address ${this.config.providerBaseUrl} detected, setting 'changeOrigin' to 'true'. This property can be overridden.`
        );
      }
    }

    if (isEmpty(this.config)) {
      throw new ConfigurationError('no configuration provided to verifier');
    }

    // This is just too messy to do on the rust side. neon-serde would have helped, but appears unmaintained
    // and is currently incompatible
    if (this.config.consumerVersionSelectors) {
      config.consumerVersionSelectorsString =
        this.config.consumerVersionSelectors.map((s) => JSON.stringify(s));
    }

    if (!this.config.provider) {
      throw new ConfigurationError('provider name is required');
    }

    if (
      (isEmpty(this.config.pactUrls) || !this.config.pactUrls) &&
      !this.config.pactBrokerUrl
    ) {
      throw new ConfigurationError(
        'a list of pactUrls or a pactBrokerUrl must be provided'
      );
    }

    return config;
  }

  // Run the Verification CLI process
  private runProviderVerification() {
    return (server: http.Server) =>
      new Promise((resolve, reject) => {
        const opts = {
          providerStatesSetupUrl: `${this.address}:${server.address().port}${
            this.stateSetupPath
          }`,
          ...this.config,
          providerBaseUrl: `${this.address}:${server.address().port}`,
        };

        try {
          PactNative.verify_provider(opts, (err, val) => {
            if (err || !val) {
              logger.trace(`verification failed (err=${err}, val=${val})`);
              reject(err);
            } else {
              logger.trace(`verification succeeded (val=${val})`);
              resolve(val);
            }
          });
          logger.trace('submitted test to verify_provider');
        } catch (e) {
          reject(e);
        }
      });
  }

  private isLocalVerification() {
    const u = new url.URL(this.config.providerBaseUrl);
    return (
      localAddresses.includes(u.host) || localAddresses.includes(u.hostname)
    );
  }
}
