'use strict'

import clone from 'lodash.clone'
import isNil from 'lodash.isnil'
import Request from './request'
import logger from '../common/logger'

export default class MockService {

  constructor (consumer, provider, port = 1234, host = '127.0.0.1') {
    if (isNil(consumer) || isNil(provider)) {
      throw new Error('Please provide the names of the provider and consumer for this Pact.')
    }

    if (isNil(port)) {
      throw new Error('Please provide the port to connect to the Pact Mock Server.')
    }

    this._request = new Request()
    this._baseURL = `http://${host}:${port}`
    this._pactDetails = {
      consumer: { name: consumer },
      provider: { name: provider }
    }
  }

  addInteraction (interaction) {
    const stringifiedInteraction = JSON.stringify(interaction)
    return this._request.send('POST', `${this._baseURL}/interactions`, stringifiedInteraction)
  }

  putInteractions (interactions) {
    const clonedInteractions = interactions.map((interaction) => clone(interaction).json())
    const stringifiedInteractions = JSON.stringify({interactions: clonedInteractions})
    return this._request.send('PUT', `${this._baseURL}/interactions`, stringifiedInteractions)
  }

  removeInteractions () {
    return this._request.send('DELETE', `${this._baseURL}/interactions`)
  }

  verify () {
    return this._request.send('GET', `${this._baseURL}/interactions/verification`)
  }

  writePact () {
    const stringifiedPactDetails = JSON.stringify(this._pactDetails)
    return this._request.send('POST', `${this._baseURL}/pact`, stringifiedPactDetails)
  }

  verifyAndWrite () {
    return this.verify().then(() => this.writePact()).then(() => logger.info('Matchers verified and Pact written.'))
  }
}
