'use strict'

import { Promise } from 'es6-promise'

import MockService from './mockService'
import Interaction from './interaction'
import logger from '../common/logger'

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
