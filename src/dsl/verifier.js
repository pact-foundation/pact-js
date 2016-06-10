'use strict'

import { Promise } from 'es6-promise'

import MockService from './mockService'
import Interaction from './interaction'
import logger from '../common/logger'

/**
 * Verification module of Pact. This is the thing (test double) that pretends to
 * be a Provider. It verifies that the Mock Interactions (expectations) that were
 * setup were in fact called and fails if they weren't.
 *
 * @module Verifier
 * @param {String} consumer - the name of the consumer
 * @param {String} provider - the name of the provider
 */
module.exports = ({consumer, provider}) => {
  logger.info(`Setting up Pact with Consumer "${consumer}" and Provider "${provider}"`)

  const mockService = new MockService(consumer, provider)

  let interactions = []

  function processResponse (response) {
    if (Array.isArray(response)) {
      const hasErrors = response
        .filter((it) => {
          const resp = it.text || it.responseText || ''
          return resp.indexOf('interaction_diffs') > -1
        })
        .map((it) => {
          const resp = it.text || it.responseText || ''
          return resp
        })
      if (hasErrors.length) {
        return Promise.reject(hasErrors)
      } else {
        return Promise.resolve(response.map((it) => it.text || it.responseText || ''))
      }
    } else {
      const resp = response.text || response.responseText
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
