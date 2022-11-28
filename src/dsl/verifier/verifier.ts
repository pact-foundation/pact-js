/**
 * Provider Verifier service
 * @module ProviderVerifier
 */
import serviceFactory from '@pact-foundation/pact-core';
import { VerifierOptions as PactCoreVerifierOptions } from '@pact-foundation/pact-core';
import { omit, isEmpty } from 'lodash';
import * as http from 'http';
import * as url from 'url';

import logger, { setLogLevel } from '../../common/logger';

import ConfigurationError from '../../errors/configurationError';
import { localAddresses } from '../../common/net';
import { createProxy, waitForServerReady } from './proxy';
import { VerifierOptions } from './types';
import { AddressInfo } from 'net';

export class Verifier {
  private address = 'http://127.0.0.1';

  private stateSetupPath = '/_pactSetup';

  private messageTransportPath = '/_messages';

  private config: VerifierOptions;

  private deprecatedFields: string[] = ['providerStatesSetupUrl'];

  constructor(config: VerifierOptions) {
    this.config = config;

    if (this.config.logLevel && !isEmpty(this.config.logLevel)) {
      serviceFactory.logLevel(this.config.logLevel);
      setLogLevel(this.config.logLevel);
    }

    this.deprecatedFields.forEach((f: keyof VerifierOptions) => {
      if (this.config[f]) {
        logger.warn(
          `${f} is deprecated, and will be removed in future versions`
        );
      }
    });

    if (this.config.validateSSL === undefined) {
      this.config.validateSSL = true;
    }

    if (this.config.proxyHost) {
      this.address = `http://${this.config.proxyHost}`;
    }

    if (this.config.changeOrigin === undefined) {
      this.config.changeOrigin = false;

      if (!this.isLocalVerification()) {
        this.config.changeOrigin = true;
        logger.debug(
          `non-local provider address ${this.config.providerBaseUrl} detected, setting 'changeOrigin' to 'true'. This property can be overridden.`
        );
      }
    }

    if (
      !this.config.providerBaseUrl &&
      !this.config.messageProviders &&
      !this?.config?.transports
    ) {
      throw new ConfigurationError(
        "'providerBaseUrl' is mandatory if no 'messageProviders' or 'transports' given"
      );
    }
  }

  /**
   * Verify a HTTP Provider
   *
   * @param config
   */
  public verifyProvider(): Promise<string> {
    logger.info('Verifying provider');

    if (isEmpty(this.config)) {
      return Promise.reject(
        new ConfigurationError('No configuration provided to verifier')
      );
    }

    // Start the verification CLI proxy server
    const server = createProxy(
      this.config,
      this.stateSetupPath,
      this.messageTransportPath
    );
    logger.trace(`proxy created, waiting for startup`);

    // Run the verification once the proxy server is available
    return waitForServerReady(server)
      .then((passOn) => {
        logger.trace(
          `Proxy is ready at ${(server.address() as AddressInfo).address}`
        );
        return passOn;
      })
      .then(this.runProviderVerification())
      .then((result) => {
        logger.trace('Verification completed, closing server');
        server.close();
        return result;
      })
      .catch((e) => {
        logger.trace(`Verification failed(${e.message}), closing server`);
        server.close();
        throw e;
      });
  }

  // Run the Verification CLI process
  private runProviderVerification() {
    return (server: http.Server) => {
      const port = (server.address() as AddressInfo).port;
      const opts: PactCoreVerifierOptions = {
        providerStatesSetupUrl: `${this.address}:${port}${this.stateSetupPath}`,
        ...omit(this.config, 'handlers'),
        providerBaseUrl: `${this.address}:${port}`,
        transports: this.config.transports?.concat([
          {
            port: port,
            path: this.messageTransportPath,
            protocol: 'message',
          },
        ]),
      };
      logger.trace(`Verifying pacts with: ${JSON.stringify(opts)}`);
      return serviceFactory.verifyPacts(opts);
    };
  }

  private isLocalVerification() {
    if (!this.config.providerBaseUrl) {
      return true;
    }

    const u = new url.URL(this.config.providerBaseUrl);
    return (
      localAddresses.includes(u.host) || localAddresses.includes(u.hostname)
    );
  }
}
