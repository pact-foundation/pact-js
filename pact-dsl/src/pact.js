'use strict'

import { Promise } from 'es6-promise'

import { logger } from './logger'
import MockService from './mockService'
import Interaction from './interaction'
import { term, eachLike, somethingLike } from './matcher'

module.exports = ({consumer, provider}) => {
  logger.info(`Setting up Pact with Consumer "${consumer}" and Provider "${provider}"`)

  const mockService = new MockService(consumer, provider)

  let interactions = []

  function processResponse (response) {
    if (Array.isArray(response)) {
      const hasErrors = response.filter((it) => it.text.includes('interaction_diffs')).map((it) => it.text)
      if (hasErrors.length) {
        return Promise.reject(hasErrors)
      } else {
        return Promise.resolve(response.map((it) => it.text))
      }
    } else {
      if (response.text.includes('interaction_diffs')) {
        return Promise.reject(response.text)
      }
      return Promise.resolve(response.text)
    }
  }

  return {
    Match: { term, eachLike, somethingLike },
    interaction: () => {
      const interaction = new Interaction()
      interactions.push(interaction)
      return interaction
    },
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
