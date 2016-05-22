'use strict'

import clone from 'lodash.clone'
import isNil from 'lodash.isnil'
import request from 'superagent-bluebird-promise'
import { logger } from './logger'

const MOCK_HEADERS = {
  'Content-Type': 'application/json',
  'X-Pact-Mock-Service': 'true'
}

function handleError (err) { throw err }

export default class MockService {

  constructor (consumer, provider, port = 1234, host = '127.0.0.1') {
    if (isNil(consumer) || isNil(provider)) {
      throw new Error('Please provide the names of the provider and consumer for this Pact.')
    }

    if (isNil(port)) {
      throw new Error('Please provide the port to connect to the Pact Mock Server.')
    }

    this._baseURL = `http://${host}:${port}`
    this._pactDetails = {
      consumer: { name: consumer },
      provider: { name: provider }
    }
  }

  addInteraction (interaction) {
    const stringifiedInteraction = JSON.stringify(interaction)
    return request.post(`${this._baseURL}/interactions`)
      .set(MOCK_HEADERS)
      .send(stringifiedInteraction)
      .then((res) => logger.info(`Interaction added: "${stringifiedInteraction}"`))
      .catch(handleError)
  }

  putInteractions (interactions) {
    const clonedInteractions = interactions.map((interaction) => clone(interaction).json())
    const stringifiedInteractions = JSON.stringify({interactions: clonedInteractions})
    return request.put(`${this._baseURL}/interactions`)
      .set(MOCK_HEADERS)
      .send(stringifiedInteractions)
      .then((res) => logger.info(`Set of interactions added: "${stringifiedInteractions}"`))
      .catch(handleError)
  }

  removeInteractions () {
    return request.del(`${this._baseURL}/interactions`)
      .set(MOCK_HEADERS)
      .then((res) => logger.info('All interactions removed.'))
      .catch(handleError)
  }

  verify () {
    return request.get(`${this._baseURL}/interactions/verification`)
      .set(MOCK_HEADERS)
      .then((res) => logger.info('Verification successful.'))
      .catch(handleError)
  }

  writePact () {
    const stringifiedPactDetails = JSON.stringify(this._pactDetails)
    return request.post(`${this._baseURL}/pact`)
      .set(MOCK_HEADERS)
      .send(stringifiedPactDetails)
      .then((res) => logger.info(`Pact successfully written with: ${stringifiedPactDetails}`))
      .catch(handleError)
  }

  verifyAndWrite () {
    return this.verify().then(() => this.writePact()).then(() => logger.info('Matchers verified and Pact written.'))
  }
}
