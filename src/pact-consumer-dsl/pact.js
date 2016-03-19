'use strict'

import clone from 'lodash.clone'
import MockService from './mockService'
import Interceptor from './interceptor'

export default ({targetHost, targetPort, consumer, provider, port}) => {
  const mockService = new MockService(consumer, provider, port)
  
  const interceptor = new Interceptor(targetHost, targetPort, mockService._baseURL)
  interceptor.interceptRequests()

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
        .then(() => mockService.removeInteractions())
        .catch((err) => { throw err })
        .finally(done)
    }
  }
}
