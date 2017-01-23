/**
 * Pact module.
 * @module Pact
 */

'use strict'

require('es6-promise').polyfill()

const isNil = require('lodash.isnil')
const logger = require('./common/logger')
const Matchers = require('./dsl/matchers')
const Verifier = require('./dsl/verifier')
const MockService = require('./dsl/mockService')
const Interaction = require('./dsl/interaction')
const responseParser = require('./common/responseParser').parse
const serviceFactory = require('@pact-foundation/pact-node')
const clc = require('cli-color')
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
 * @return {@link PactProvider}
 * @static
 */
module.exports = (opts) => {
  const consumer = opts.consumer
  const provider = opts.provider

  if (isNil(consumer)) {
    throw new Error('You must specify a Consumer for this pact.')
  }

  if (isNil(provider)) {
    throw new Error('You must specify a Provider for this pact.')
  }

  const port = opts.port || 1234
  const host = opts.host || '127.0.0.1'
  const ssl = opts.ssl || false
  const dir = opts.dir || path.resolve(process.cwd(), 'pacts')
  const log = opts.log || path.resolve(process.cwd(), 'logs', 'pact.log')
  const logLevel = opts.logLevel || 'INFO'
  const spec = opts.spec || 2
  const server = serviceFactory.createServer({
      port: port,
      log: log,
      dir: dir,
      spec: spec
    });
  serviceFactory.logLevel(logLevel);

  logger.info(`Setting up Pact with Consumer "${consumer}" and Provider "${provider}" using mock service on Port: "${port}"`)

  const mockService = new MockService(consumer, provider, port, host, ssl)

  /** @namespace PactProvider */
  return {

    /**
     * Start the Mock Server.
     * @returns {Promise}
     */
    setup: () => {
      return server.start()
    },

    /**
     * Add an interaction to the {@link MockService}.
     * @memberof PactProvider
     * @instance
     * @param {Interaction} interactionObj
     * @returns {Promise}
     */
    addInteraction: (interactionObj) => {
      let interaction = new Interaction()

      if (interactionObj.state) {
        interaction.given(interactionObj.state)
      }

      interaction
        .uponReceiving(interactionObj.uponReceiving)
        .withRequest(interactionObj.withRequest)
        .willRespondWith(interactionObj.willRespondWith)

      return mockService.addInteraction(interaction)
    },

    /**
     * Checks with the Mock Service if the expected interactions have been exercised.
     * TODO: Should this finalise and write pact also?
     * @memberof PactProvider
     * @instance
     * @returns {Promise}
     */
    verify: () => {
      return mockService.verify()
        .then(() => mockService.removeInteractions())
        .catch(e => {
          // Properly format the error
          console.error('')
          console.error(clc.red('Pact verification failed!'))
          console.error(clc.red(e))

          throw new Error('Pact verification failed - expected interactions did not match actual.')
        })
    },
    /**
     * Writes the Pact and clears any interactions left behind.
     * @memberof PactProvider
     * @instance
     * @returns {Promise}
     */
    finalize: () => {
      return mockService.writePact().then(() => mockService.removeInteractions())
    },
    /**
     * Writes the pact file out to file. Should be called when all tests have been performed for a
     * given Consumer <-> Provider pair. It will write out the Pact to the
     * configured file.
     * @memberof PactProvider
     * @instance
     * @returns {Promise}
     */
    writePact: () => {
      return mockService.writePact()
    },
    /**
     * Clear up any interactions in the Provider Mock Server.
     * @memberof PactProvider
     * @instance
     * @returns {Promise}
     */
    removeInteractions: () => {
      return mockService.removeInteractions()
    }
  }
}

/**
 * Exposes {@link Verifier}
 * @memberof Pact
 * @static
 */
module.exports.Verifier = Verifier

/**
 * Exposes {@link Matchers#term}
 * @memberof Pact
 * @static
 */
module.exports.Matchers = Matchers
