'use strict'

import MockService from './mockService'
import Interceptor from './interceptor'
import Interaction from './interaction'

import { logger } from './logger'

export default ({consumer, provider}) => {
  logger.info(`Setting up Pact with Consumer "${consumer}" and Provider "${provider}"`)

  const mockService = new MockService(consumer, provider)
  const interceptor = new Interceptor(mockService._baseURL)

  let interactions = []

  return {
    intercept: (interceptedUrl) => {
      interceptor.interceptRequestsOn(interceptedUrl)
    },
    interaction: () => {
      const interaction = new Interaction()
      interactions.push(interaction)
      return interaction
    },
    verify: (integrationFn) => {
      if (interceptor.disabled) {
        logger.info('Interceptor is disabled. You should have told the interceptor which URLs to intercept. This test will most likely fail!')
        interceptor.interceptRequestsOn()
      }

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
        .finally(() => interceptor.stopIntercepting())
        .then(() => integrationFnResult)
    }
  }
}
