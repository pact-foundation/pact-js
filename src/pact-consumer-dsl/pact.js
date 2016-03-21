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
          const parsedBody = JSON.parse(res.text)
          console.log(res.text)
          if (parsedBody.error) {
            return Promise.reject(new Error(parsedBody.body.message, parsedBody.body.interaction_diffs))
          }
          return Promise.resolve()
        })
        .then(() => mockService.verify())
        .then(() => mockService.writePact())
        .then(() => {
          interactions = []
          return mockService.removeInteractions()
        })
        .catch((err) => { console.log(err) })
        .finally(done)
    }
  }
}
