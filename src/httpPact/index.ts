/* eslint-disable no-promise-executor-return */
import serviceFactory from '@pact-foundation/pact-core';

import {
  ConsumerPact,
  ConsumerInteraction,
  makeConsumerPact,
} from '@pact-foundation/pact-core/src/consumer/index';

import * as path from 'path';
// import clc from 'cli-color';
import process from 'process';
import { isEmpty } from 'lodash';
import { Server } from '@pact-foundation/pact-core/src/server';

import {
  Interaction,
  InteractionObject,
  RequestOptions,
  ResponseOptions,
  Headers,
} from '../dsl/interaction';
import { freePort, isPortAvailable } from '../common/net';
import logger, { setLogLevel } from '../common/logger';
import { LogLevel, PactOptions, PactOptionsComplete } from '../dsl/options';
// import VerificationError from '../errors/verificationError';
import ConfigurationError from '../errors/configurationError';
import { traceHttpInteractions } from './tracing';
import { SpecificationVersion } from '../../v3';
import { version as pactPackageVersion } from '../../package.json';
import { Matcher, matcherValueOrString } from '../dsl/matchers';
import { forEachObjIndexed } from 'ramda';
import { isArray } from 'util';
import { generateMockServerError } from '../v3/display';
import { numberToSpec } from '../common/spec';

// TODO: revisit this in the new mock server design
// const logErrorNoMockServer = () => {
//   logger.error(
//     "The pact mock service doesn't appear to be running\n" +
//       '  - Please check the logs above to ensure that there are no pact service startup failures\n' +
//       '  - Please check that pact lifecycle methods are called in the correct order (setup() needs to be called before this method)\n' +
//       '  - Please check that your test code waits for the promises returned from lifecycle methods to complete before calling the next one\n' +
//       "  - To learn more about what is happening during your pact run, try setting logLevel: 'DEBUG'"
//   );
// };

/**
 * Creates a new {@link PactProvider}.
 * @memberof Pact
 * @name create
 * @param {PactOptions} opts
 * @return {@link PactProvider}
 */
export class Pact {
  public static defaults = {
    consumer: '',
    cors: false,
    dir: path.resolve(process.cwd(), 'pacts'),
    host: '127.0.0.1',
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    logLevel: 'info',
    pactfileWriteMode: 'merge',
    provider: '',
    spec: 2,
    ssl: false,
    port: 0,
  } as PactOptions;

  public static createOptionsWithDefaults(
    opts: PactOptions
  ): PactOptionsComplete {
    return { ...Pact.defaults, ...opts } as PactOptionsComplete;
  }

  public server: Server;

  public opts: PactOptionsComplete;

  private mockServerStartedPort?: number;

  private pact: ConsumerPact;

  private interaction: ConsumerInteraction;

  private finalized: boolean;

  constructor(config: PactOptions) {
    this.opts = Pact.createOptionsWithDefaults(config);

    if (this.opts.pactfileWriteMode === 'overwrite') {
      logger.warn(
        "WARNING: the behaviour of pactfileWriteMode 'overwrite' has changed since version 9.x.x. See the type definition or the MIGRATION.md guide for details."
      );
    }

    if (isEmpty(this.opts.consumer)) {
      throw new ConfigurationError(
        'You must specify a Consumer for this pact.'
      );
    }

    if (isEmpty(this.opts.provider)) {
      throw new ConfigurationError(
        'You must specify a Provider for this pact.'
      );
    }

    setLogLevel(this.opts.logLevel as LogLevel);
    serviceFactory.logLevel(this.opts.logLevel);

    if (this.opts.logLevel === 'trace') {
      traceHttpInteractions();
    }

    this.reset();
  }

  /**
   * Setup the pact framework, including allocating a port for the dynamic
   * mock server
   *
   * @returns {Promise}
   */
  public setup(): Promise<PactOptionsComplete> {
    if (this.opts.port > 0) {
      return isPortAvailable(this.opts.port, this.opts.host).then(
        () => this.opts
      );
    }

    return freePort().then((port) => {
      logger.debug(`free port discovered: ${port}`);

      this.opts.port = port;

      return this.opts;
    });
  }

  /**
   * Add an interaction to the {@link MockService}.
   * @memberof PactProvider
   * @instance
   * @param {Interaction} interactionObj
   * @returns {Promise}
   */
  public addInteraction(
    interactionObj: InteractionObject | Interaction
  ): Promise<string> {
    let interaction: InteractionObject;

    if (interactionObj instanceof Interaction) {
      // This will throw if not valid
      const interactionState = interactionObj.json();

      // Convert into the same type
      interaction = {
        state: interactionState.providerState,
        uponReceiving: interactionState.description,
        withRequest: {
          method: interactionState.request?.method,
          path: interactionState.request?.path,
          query: interactionState.request?.query,
          body: interactionState.request?.body,
          headers: interactionState.request?.headers,
        },
        willRespondWith: {
          status: interactionState.response?.status,
          body: interactionState.response?.body,
          headers: interactionState.response?.headers,
        },
      };
    } else {
      interaction = interactionObj;
    }

    this.interaction.uponReceiving(interaction.uponReceiving);
    if (interaction.state) {
      this.interaction.given(interaction.state);
    }
    setRequestDetails(this.interaction, interaction.withRequest);
    setResponseDetails(this.interaction, interaction.willRespondWith);

    // Actually start the server now.....
    logger.info(`Setting up Pact with Consumer "${this.opts.consumer}" and Provider "${this.opts.provider}"
        using mock service on Port: "${this.opts.port}"`);

    const port = this.pact.createMockServer(
      this.opts.host,
      this.opts.port,
      this.opts.ssl
    );
    this.mockServerStartedPort = port;

    logger.debug(`mock service started on port: ${port}`);

    return Promise.resolve('');
  }

  /**
   * Checks with the Mock Service if the expected interactions have been exercised.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public verify(): Promise<string> {
    // TODO: bring back nice messages for common failure cases as to why this method can't be called

    const matchingResults = this.pact.mockServerMismatches(this.opts.port);
    const success = this.pact.mockServerMatchedSuccessfully(this.opts.port);

    // Feature flag: allow missing requests on the mock service
    if (!success) {
      let error = 'Test failed for the following reasons:';
      error += `\n\n  ${generateMockServerError(matchingResults, '\t')}`;

      this.reset();
      return Promise.reject(new Error(error));
    }

    return this.writePact()
      .then(() => this.reset())
      .then(() => '');
  }

  /**
   * Writes the Pact and clears any interactions left behind and shutdown the
   * mock server
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public finalize(): Promise<void> {
    if (this.finalized) {
      logger.warn(
        'finalize() has already been called, this is probably a logic error in your test setup. ' +
          'In the future this will be an error.'
      );
    }
    this.finalized = true;

    return Promise.resolve();
  }

  /**
   * Writes the pact file out to file. Should be called when all tests have been performed for a
   * given Consumer <-> Provider pair. It will write out the Pact to the
   * configured file.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public writePact(): Promise<string> {
    this.pact.writePactFile(
      this.opts.dir || './pacts',
      this.opts.pactfileWriteMode !== 'overwrite'
    );

    return Promise.resolve('');
  }

  /**
   * Clear up any interactions in the Provider Mock Server.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public removeInteractions(): Promise<string> {
    logger.info(
      'removeInteractions() is no longer required to be called, but has been kept for compatibility with upgrade from 9.x.x. You should remove any use of this method.'
    );
    return Promise.resolve('');
  }

  private checkPort(): Promise<void> {
    if (this.server && this.server.options.port) {
      return isPortAvailable(this.server.options.port, this.opts.host);
    }
    return Promise.resolve();
  }

  // reset the internal state
  // (this.pact cannot be re-used between tests)
  private reset() {
    this.pact = makeConsumerPact(
      this.opts.consumer,
      this.opts.provider,
      numberToSpec(
        this.opts.spec,
        SpecificationVersion.SPECIFICATION_VERSION_V2
      ),
      this.opts.logLevel ?? 'info'
    );
    this.interaction = this.pact.newInteraction('');

    if (this.mockServerStartedPort) {
      logger.debug(`cleaning up old mock server on port ${this.opts.port}`);
      const res = this.pact.cleanupMockServer(this.mockServerStartedPort);

      if (!res) {
        logger.warn('Unable to cleanup the Pact mock server. ');
      }

      this.mockServerStartedPort = undefined;
    }
    this.pact.addMetadata('pact-js', 'version', pactPackageVersion);
  }
}

const contentTypeFromHeaders = (
  headers: Headers | undefined,
  defaultContentType: string
) => {
  let contentType: string | Matcher<string> = defaultContentType;
  forEachObjIndexed((v, k) => {
    if (`${k}`.toLowerCase() === 'content-type') {
      contentType = matcherValueOrString(v);
    }
  }, headers || {});

  return contentType;
};

const setRequestDetails = (
  interaction: ConsumerInteraction,
  req: RequestOptions
) => {
  if (req?.method && req?.path) {
    const method = req?.method;
    const reqPath = matcherValueOrString(req?.path);
    logger.debug(`adding request details: ${method} ${reqPath}`);
    interaction.withRequest(method, reqPath);
  }

  if (req?.body) {
    interaction.withRequestBody(
      matcherValueOrString(req.body),
      contentTypeFromHeaders(req.headers, 'application/json')
    );
  }

  interaction.withRequest(req.method, matcherValueOrString(req.path));
  forEachObjIndexed((v, k) => {
    interaction.withRequestHeader(k, 0, matcherValueOrString(v));
  }, req.headers);

  forEachObjIndexed((v, k) => {
    if (isArray(v)) {
      (v as unknown[]).forEach((vv, i) => {
        interaction.withQuery(k, i, matcherValueOrString(vv));
      });
    } else {
      interaction.withQuery(k, 0, matcherValueOrString(v));
    }
  }, req.query);

  // TODO: body
};

const setResponseDetails = (
  interaction: ConsumerInteraction,
  res: ResponseOptions
) => {
  interaction.withStatus(res.status);

  if (res?.body) {
    interaction.withResponseBody(
      matcherValueOrString(res.body),
      contentTypeFromHeaders(res.headers, 'application/json')
    );
  }

  forEachObjIndexed((v, k) => {
    interaction.withResponseHeader(k, 0, matcherValueOrString(v));
  }, res.headers);
};
