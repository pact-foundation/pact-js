'use strict'

import clone from 'lodash.clone'
import isNil from 'lodash.isnil'
import request from 'superagent-bluebird-promise'

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
    return request.post(`${this._baseURL}/interactions`)
      .set(MOCK_HEADERS)
      .send(JSON.stringify(interaction))
      .then((res) => 'Interaction added.')
      .catch(handleError)
  }

  putInteractions (interactions) {
    const clonedInteractions = interactions.map((interaction) => clone(interaction).json())
    return request.put(`${this._baseURL}/interactions`)
      .set(MOCK_HEADERS)
      .send(JSON.stringify({interactions: clonedInteractions}))
      .then((res) => 'Interactions added.')
      .catch(handleError)
  }

  removeInteractions () {
    return request.del(`${this._baseURL}/interactions`)
      .set(MOCK_HEADERS)
      .then((res) => 'Interactions removed.')
      .catch(handleError)
  }

  verify () {
    return request.get(`${this._baseURL}/interactions/verification`)
      .set(MOCK_HEADERS)
      .then((res) => 'Verification successful.')
      .catch(handleError)
  }

  writePact () {
    return request.post(`${this._baseURL}/pact`)
      .set(MOCK_HEADERS)
      .send(JSON.stringify(this._pactDetails))
      .then((res) => 'Pact written.')
      .catch(handleError)
  }

  verifyAndWrite () {
    return this.verify().then(() => this.writePact()).then(() => 'Matchers verified and Pact written.')
  }
}
