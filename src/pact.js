'use strict'

require('es6-promise').polyfill()

var isNil = require('lodash.isnil')
var logger = require('./common/logger')
var MockService = require('./dsl/mockService').default
var Interaction = require('./dsl/interaction').default
var responseParser = require('./common/responseParser').default

var Interceptor = require('./interceptor').default
var Matchers = require('./dsl/matchers')

/**
 * Entry point for the Pact library and Verification module of Pact.
 * This is the thing (test double) that pretends to be a Provider.
 * It verifies that the Mock Interactions (expectations) that were
 * setup were in fact called and fails if they weren't.
 *
 * @module Pact
 * @param {String} consumer - the name of the consumer
 * @param {String} provider - the name of the provider
 * @param {number} port - port of the mock service, defaults to 1234
 * @returns {Object} Pact - returns an {@link Interceptor}, a {@link Matcher#term}, a {@link Matcher#eachLike}, a {@link Matcher#somethingLike} and an {@link Interaction}.
 */
module.exports = ({consumer, provider, port = 1234, ssl = false}) => {
  if (isNil(consumer)) {
    throw new Error('You must inform a Consumer for this Pact.')
  }

  if (isNil(provider)) {
    throw new Error('You must inform a Provider for this Pact.')
  }

  logger.info(`Setting up Pact with Consumer "${consumer}" and Provider "${provider}" using mock service on Port: "${port}"`)

  const mockService = new MockService(consumer, provider, port, '127.0.0.1', ssl)

  return {
    /**
     * Creates and adds a new {@link Interaction} to the Pact Mock Server.
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
     * Executes a promise chain that will eventually write the Pact file if successful.
     * @param {Response|Response[]} response - the response object or an Array of response objects of the Request(s) issued
     * @returns {Promise}
     */
    verify: (response) => {
      let integrationFnResult

      return responseParser(response)
        .then((res) => { integrationFnResult = res })
        .then(() => mockService.verify())
        .then(() => integrationFnResult)
    },
    /**
     * Writes the Pact and clears any interactions left behind.
     * @returns {Promise}
     */
    finalize: () => {
      return mockService.writePact().then(() => mockService.removeInteractions())
    },
    /**
     * Writes the Pact file but leave interactions in.
     * @returns {Promise}
     */
    writePact: () => {
      return mockService.writePact()
    },
    /**
     * Clear up any interactions in the Provider Mock Server.
     * @returns {Promise}
     */
    removeInteractions: () => {
      return mockService.removeInteractions()
    }
  }
}

module.exports.Matchers = Matchers
module.exports.Interceptor = Interceptor
