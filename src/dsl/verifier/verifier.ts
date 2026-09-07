/**
 * Provider Verifier service
 * @module ProviderVerifier
 */

import type * as http from 'node:http';
import type { AddressInfo } from 'node:net';
import url from 'node:url';
import serviceFactory, {
  type VerifierOptions as PactCoreVerifierOptions,
} from '@pact-foundation/pact-core';
import { isEmpty, omit } from 'lodash';
import logger, { setLogLevel } from '../../common/logger';
import { localAddresses } from '../../common/net';
import ConfigurationError from '../../errors/configurationError';
import { createHooksState, createProxy, waitForServerReady } from './proxy';
import {
  ProviderVerificationError,
  parseVerificationResult,
  type VerificationResult,
} from './result';
import type { VerifierOptions } from './types';

export class Verifier {
  private address = 'http://127.0.0.1';

  private stateSetupPath = '/_pactSetup';

  private messageTransportPath = '/_messages';

  private config: VerifierOptions;

  private deprecatedFields: Array<keyof VerifierOptions> = [
    'providerStatesSetupUrl',
  ];

  constructor(config: VerifierOptions) {
    this.config = config;

    if (this.config.logLevel && !isEmpty(this.config.logLevel)) {
      serviceFactory.logLevel(this.config.logLevel);
      setLogLevel(this.config.logLevel);
    }

    this.deprecatedFields.forEach((f) => {
      if (this.config[f]) {
        logger.warn(
          `${f} is deprecated, and will be removed in future versions`,
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
          `non-local provider address ${this.config.providerBaseUrl} detected, setting 'changeOrigin' to 'true'. This property can be overridden.`,
        );
      }
    }

    if (
      !this.config.providerBaseUrl &&
      !this.config.messageProviders &&
      !this?.config?.transports
    ) {
      throw new ConfigurationError(
        "'providerBaseUrl' is mandatory if no 'messageProviders' or 'transports' given",
      );
    }
  }

  /**
   * Verify a HTTP Provider
   *
   * Resolves with the raw output of the core (a JSON document with
   * @pact-foundation/pact-core >= 19) and rejects when the verification
   * fails. Use {@link verify} to get a structured result instead.
   */
  public verifyProvider(): Promise<string> {
    logger.info('Verifying provider');

    if (isEmpty(this.config)) {
      return Promise.reject(
        new ConfigurationError('No configuration provided to verifier'),
      );
    }

    // Start the verification CLI proxy server. The hooks state is owned here so
    // that any beforeEach/afterEach failures recorded during verification can be
    // surfaced once it completes.
    const hooksState = createHooksState();
    const server = createProxy(
      this.config,
      this.stateSetupPath,
      this.messageTransportPath,
      hooksState,
    );
    logger.trace(`proxy created, waiting for startup`);

    // Run the verification once the proxy server is available
    return waitForServerReady(server)
      .then((passOn) => {
        logger.trace(
          `Proxy is ready at ${(server.address() as AddressInfo).address}`,
        );
        return passOn;
      })
      .then(this.runProviderVerification())
      .then((result) => {
        logger.trace('Verification completed, closing server');
        server.close();
        if (hooksState.errors.length > 0) {
          throw new Error(
            `Provider verification hooks failed:\n${hooksState.errors
              .map((e) => `  - ${e.message}`)
              .join('\n')}`,
          );
        }
        return result;
      })
      .catch((e) => {
        logger.trace(`Verification failed(${e.message}), closing server`);
        server.close();
        throw e;
      });
  }

  /**
   * Verify a HTTP Provider and return the structured result.
   *
   * Runs the same verification as {@link verifyProvider}, but resolves with
   * a {@link VerificationResult} holding one entry per verified interaction.
   *
   * @throws {ProviderVerificationError} when at least one interaction failed;
   *         the error carries the complete result in `error.result`
   * @throws {Error} when the verification could not be executed at all
   *         (e.g. configuration errors, hook failures or a core crash)
   */
  public async verify(): Promise<VerificationResult> {
    let output: string;
    try {
      output = await this.verifyProvider();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const result = tryParseVerificationResult(message);
      if (result) {
        throw new ProviderVerificationError(result);
      }
      throw e;
    }
    const result = parseVerificationResult(output);
    if (!result.success) {
      throw new ProviderVerificationError(result);
    }
    return result;
  }

  // Run the Verification CLI process
  private runProviderVerification() {
    return (server: http.Server) => {
      const { port } = server.address() as AddressInfo;
      const opts: PactCoreVerifierOptions = {
        providerStatesSetupUrl: `${this.address}:${port}${this.stateSetupPath}`,
        ...omit(this.config, 'handlers', 'tlsClientOptions'),
        providerBaseUrl: `${this.address}:${port}`,
        transports: (this.config.transports || []).concat([
          {
            port,
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

const tryParseVerificationResult = (
  raw: string,
): VerificationResult | undefined => {
  try {
    return parseVerificationResult(raw);
  } catch {
    return undefined;
  }
};
