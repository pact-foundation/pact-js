'use strict'

import clone from 'lodash.clone'
import MockService from './mockService'
import Interceptor from './interceptor'

export default ({targetHost, consumer, provider, port}) => {
  const mockService = new MockService(consumer, provider, port)
  const interceptor = new Interceptor(targetHost, mockService._baseURL)

  return {
    addInteraction: (interaction) => {
      const interactionState = clone(interaction.json())
      mockService.addInteraction(interactionState)
      interceptor.addRequestHeaders(interactionState.request.headers)
    },
    clearInteractions: () => {
      mockService.removeInteractions()
    },
    verify: (done) => {
      mockService.verifyAndWrite()
        .then(() => mockService.removeInteractions().then(done))
        .catch((err) => { throw err })
    }
  }
}
