'use strict'

import MockService from './mockService'
import Interaction from './interaction'

import { logger } from './logger'

module.exports = ({consumer, provider}) => {
  logger.info(`Setting up Pact with Consumer "${consumer}" and Provider "${provider}"`)

  const mockService = new MockService(consumer, provider)

  let interactions = []

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
        .then((res) => {
          if (Array.isArray(res)) {
            res.forEach((it) => {
              if (it.text.includes('interaction_diffs') || it.text.includes('Unexpected requests')) {
                return Promise.reject(it.text)
              }
            })
            return Promise.resolve(res.map((it) => it.text))
          } else {
            if (res.text.includes('interaction_diffs') || res.text.includes('Unexpected requests')) {
              return Promise.reject(res.text)
            }
            return Promise.resolve(res.text)
          }
        })
        .then((res) => { integrationFnResult = res })
        .then(() => mockService.verify())
        .then(() => mockService.writePact())
        .then(() => mockService.removeInteractions())
        .then(() => { interactions = [] })
        .then(() => integrationFnResult)
    }
  }
}
