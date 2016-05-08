'use strict'

import MockService from './mockService'
import Interceptor from './interceptor'
import Interaction from './interaction'

export default ({consumer, provider}) => {
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
    verify: (integrationFn, done) => {
      if (interceptor.disabled) {
        interceptor.interceptRequestsOn()
      }

      return mockService.putInteractions(interactions)
        .then(integrationFn)
        .then((res) => {
          if (Array.isArray(res)) {
            res.forEach((it) => {
              if (it.text.includes('interaction_diffs')) {
                throw new Error(it.text)
              }
            })
            return Promise.resolve(res.map((it) => it.text))
          } else {
            if (res.text.includes('interaction_diffs')) {
              throw new Error(res.text)
            }
            return Promise.resolve(res.text)
          }
        })
        .then((res) => {
          done(null, res)
          return Promise.resolve()
        })
        .then(() => mockService.verify())
        .then(() => mockService.writePact())
        .then(() => {
          interactions = []
          return mockService.removeInteractions()
        })
        .catch(done)
    }
  }
}
