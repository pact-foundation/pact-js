/**
 * Pact module.
 * @module Pact
 */

import { isNil } from 'lodash';
import { isPortAvailable } from './common/net';
import { MockService, PactfileWriteMode } from './dsl/mockService';
import { Interaction, InteractionObject } from './dsl/interaction';
import * as serviceFactory from '@pact-foundation/pact-node';
import * as path from 'path';
import * as process from 'process';
import * as Matchers from './dsl/matchers';
import * as Verifier from './dsl/verifier';
import * as clc from 'cli-color';
import { logger } from './common/logger';

// TODO: alias type for Pact for backwards compatibility?
//       Add deprecation notice?

/**
 * Creates a new {@link PactProvider}.
 * @memberof Pact
 * @name create
 * @param {PactOptions} opts
 * @return {@link PactProvider}
 * @static
 */
export class Pact {
  public server: any;
  public opts: PactOptionsComplete;
  public mockService: MockService;

  constructor(config: PactOptions) {
    const defaults = {
      consumer: '',
      provider: '',
      port: 1234,
      host: '127.0.0.1',
      ssl: false,
      dir: path.resolve(process.cwd(), 'pacts'),
      log: path.resolve(process.cwd(), 'logs', 'pact.log'),
      logLevel: 'INFO',
      spec: 2,
      cors: false,
      pactfileWriteMode: 'overwrite'
    } as PactOptions;

    this.opts = { ...defaults, ...config } as PactOptionsComplete;

    if (this.opts.consumer === '') {
      throw new Error('You must specify a Consumer for this pact.');
    }

    if (this.opts.provider === '') {
      throw new Error('You must specify a Provider for this pact.');
    }

    this.server = serviceFactory.createServer({
      port: this.opts.port,
      log: this.opts.log,
      dir: this.opts.dir,
      spec: this.opts.spec,
      ssl: this.opts.ssl,
      sslcert: this.opts.sslcert,
      sslkey: this.opts.sslkey,
      cors: this.opts.cors
    });
    serviceFactory.logLevel(this.opts.logLevel);

    logger.info(`Setting up Pact with Consumer "${this.opts.consumer}" and Provider "${this.opts.provider}"
   using mock service on Port: "${this.opts.port}"`)

    this.mockService = new MockService(this.opts.consumer, this.opts.provider, this.opts.port, this.opts.host,
      this.opts.ssl, this.opts.pactfileWriteMode);
  }

  /**
   * Start the Mock Server.
   * @returns {Promise}
   */
  setup(): Promise<void> {
    return isPortAvailable(this.opts.port, this.opts.host).then(() => this.server.start());
  }

  /**
   * Add an interaction to the {@link MockService}.
   * @memberof PactProvider
   * @instance
   * @param {Interaction} interactionObj
   * @returns {Promise}
   */
  addInteraction(interactionObj: InteractionObject): Promise<string> {
    const interaction = new Interaction();

    if (interactionObj.state) {
      interaction.given(interactionObj.state);
    }

    interaction
      .uponReceiving(interactionObj.uponReceiving)
      .withRequest(interactionObj.withRequest)
      .willRespondWith(interactionObj.willRespondWith);

    return this.mockService.addInteraction(interaction);
  }

  /**
   * Checks with the Mock Service if the expected interactions have been exercised.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  verify(): Promise<string> {
    return this.mockService.verify()
      .then(() => this.mockService.removeInteractions())
      .catch((e: any) => {
        // Properly format the error
        console.error('')
        console.error(clc.red('Pact verification failed!'))
        console.error(clc.red(e))

        throw new Error('Pact verification failed - expected interactions did not match actual.')
      })
  }

  /**
   * Writes the Pact and clears any interactions left behind and shutdown the
   * mock server
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  finalize(): Promise<void> {
    return this.mockService.writePact()
      .then(() => this.server.delete())
      .catch((err: Error) => {
        return Promise.all([this.server.delete(), Promise.reject(err)]);
      });
  }

  /**
   * Writes the pact file out to file. Should be called when all tests have been performed for a
   * given Consumer <-> Provider pair. It will write out the Pact to the
   * configured file.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  writePact(): Promise<string> {
    return this.mockService.writePact();
  }

  /**
   * Clear up any interactions in the Provider Mock Server.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  removeInteractions(): Promise<string> {
    return this.mockService.removeInteractions();
  }
}

// declare namespace pact {

/**
 * @param {string} opts.consumer - the name of the consumer
 * @param {string} opts.provider - the name of the provider
 * @param {number} opts.port - port of the mock service, defaults to 1234
 * @param {string} opts.host - host address of the mock service, defaults to 127.0.0.1
 * @param {boolean} opts.ssl - SSL flag to identify the protocol to be used (default false, HTTP)
 * @param {boolean} opts.cors - allow CORS OPTION requests to be accepted, defaults to false
 * @param {string} pactfileWriteMode - 'overwrite' | 'update', 'none', defaults to 'overwrite'
 */
export interface PactOptions {
  consumer: string;
  provider: string;
  port?: number;
  host?: string;
  ssl?: boolean;
  sslcert?: string;
  sslkey?: string;
  dir?: string;
  log?: string;
  logLevel?: string;
  spec?: number;
  cors?: boolean;
  pactfileWriteMode?: PactfileWriteMode;
}

export interface MandatoryPactOptions {
  port: number;
  host: string;
  ssl: boolean;
}

export type PactOptionsComplete = PactOptions & MandatoryPactOptions;

/**
 * Exposes {@link Verifier}
 * @memberof Pact
 * @static
 */
export { verifyProvider } from './dsl/verifier';

/**
 * Exposes {@link Matchers#term}
 * @memberof Pact
 * @static
 */
export { term, eachLike, somethingLike, somethingLike as like } from './dsl/matchers';
