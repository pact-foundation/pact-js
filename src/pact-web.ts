/**
 * Pact module for Web use.
 * @module Pact Web
 */

'use strict'

import { isEmpty } from 'lodash';
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
import { polyfill } from 'es6-promise';
polyfill();

/**
 * Creates a new {@link PactProvider}.
 * @memberof Pact
 * @name create
 * @param {Object} opts
 * @param {string} opts.consumer - the name of the consumer
 * @param {string} opts.provider - the name of the provider
 * @param {number} opts.port - port of the mock service, defaults to 1234
 * @param {string} opts.host - host address of the mock service, defaults to 127.0.0.1
 * @param {boolean} opts.ssl - SSL flag to identify the protocol to be used (default false, HTTP)
 * @param {string} pactfileWriteMode - 'overwrite' | 'update' | 'smart' | 'none', defaults to 'overwrite'
 * @return {@link PactProvider}
 * @static
 */
export class PactWeb {
  private mockService: MockService;
  private server: any;
  private opts: PactOptionsComplete;

  constructor(config: PactOptions) {
    const defaults = {
      consumer: '',
      provider: '',
      port: 1234,
      host: '127.0.0.1',
      ssl: false,
      spec: 2,
      cors: false,
      pactfileWriteMode: 'overwrite'
    } as PactOptions;

    this.opts = { ...defaults, ...config } as PactOptionsComplete;

    if (isEmpty(this.opts.consumer)) {
      throw new Error('You must specify a Consumer for this pact.');
    }

    if (isEmpty(this.opts.provider)) {
      throw new Error('You must specify a Provider for this pact.');
    }

    logger.info(`Setting up Pact with Consumer "${this.opts.consumer}" and Provider "${this.opts.provider}"
   using mock service on Port: "${this.opts.port}"`)

    this.mockService = new MockService(this.opts.consumer, this.opts.provider, this.opts.port, this.opts.host,
      this.opts.ssl, this.opts.pactfileWriteMode);
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
        throw new Error(e);
      });
  }
  /**
   * Writes the Pact and clears any interactions left behind.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  finalize(): Promise<string> {
    return this.mockService.writePact().then(() => this.mockService.removeInteractions());
  }
  /**
   * Writes the Pact file but leave interactions in.
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
 * Exposes {@link Matchers#term}
 * @memberof Pact
 * @static
 */
module.exports.Matchers = Matchers
