/**
 * Pact module for Karma use.
 * @module Pact Karma
 */

'use strict'

require('es6-promise').polyfill()

var isNil = require('lodash.isnil')
var logger = require('./common/logger')
var Matchers = require('./dsl/matchers')
var MockService = require('./dsl/mockService')
var Interaction = require('./dsl/interaction')
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
  var consumer = opts.consumer
  var provider = opts.provider

  if (isNil(consumer)) {
    throw new Error('You must provide a Consumer for this pact.')
  }

  if (isNil(provider)) {
    throw new Error('You must provide a Provider for this pact.')
  }

  var port = opts.port || 1234
  var host = opts.host || '127.0.0.1'
  var ssl = opts.ssl || false

  logger.info(`Setting up Pact with Consumer "${consumer}" and Provider "${provider}" using mock service on Port: "${port}"`)

  const mockService = new MockService(consumer, provider, port, host, ssl)

  /** @namespace PactProvider */
  return {
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
          console.error('Pact verification failed!')
          console.error(e)

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
     * Writes the Pact file but leave interactions in.
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
 * Exposes {@link Matchers#term}
 * @memberof Pact
 * @static
 */
module.exports.Matchers = Matchers
