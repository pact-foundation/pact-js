'use strict'

import { Promise } from 'es6-promise'

import logger from './common/logger'
import Interceptor from './interceptor'
import MockService from './dsl/mockService'
import Interaction from './dsl/interaction'
import { term, eachLike, somethingLike } from './dsl/matchers'

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
module.exports = ({consumer, provider, port = 1234}) => {
  logger.info(`Setting up Pact with Consumer "${consumer}" and Provider "${provider}" using mock service on Port: "${port}"`)

  const mockService = new MockService(consumer, provider, port)

  let interactions = []

  function getResponseText (response) {
    let responseText = response.text || response.responseText
    if (typeof response === 'string' && (typeof responseText === 'undefined')) {
      responseText = response
    }
    return responseText || ''
  }

  function processResponse (response) {
    if (Array.isArray(response)) {
      const hasErrors = response
        .filter((it) => getResponseText(it).indexOf('interaction_diffs') > -1)
        .map((it) => getResponseText(it))

      if (hasErrors.length) {
        return Promise.reject(hasErrors)
      } else {
        return Promise.resolve(response.map((it) => getResponseText(it)))
      }
    } else {
      let resp = getResponseText(response)
      if (resp.indexOf('interaction_diffs') > -1) {
        return Promise.reject(resp)
      }
      return Promise.resolve(resp)
    }
  }

  return {
    /**
     * Creates an {@link Interaction}, adds to its internal collection and returns that {@link Interaction}.
     * @returns {@link Interaction}
     */
    interaction: () => {
      const interaction = new Interaction()
      interactions.push(interaction)
      return interaction
    },
    /**
     * Executes a promise chain that will eventually write the Pact file if successful.
     * @param {Function} integrationFn - the function that triggers a HTTP request to the provider
     * @returns {Promise}
     */
    verify: (integrationFn) => {
      let integrationFnResult

      return mockService.putInteractions(interactions)
        .then(() => integrationFn())
        .then(processResponse)
        .then((res) => { integrationFnResult = res })
        .then(() => mockService.verify())
        .then(() => mockService.writePact())
        .then(() => mockService.removeInteractions())
        .then(() => { interactions = [] })
        .then(() => integrationFnResult)
    }
  }
}

module.exports.Interceptor = Interceptor
module.exports.Matcher = { term, eachLike, somethingLike }
