'use strict'

import request from 'superagent-bluebird-promise'

const MOCK_HEADERS = {
  'Content-Type': 'application/json',
  'X-Pact-Mock-Service': 'true'
}

function handleError (err) { throw err }

export default class MockService {

  constructor (consumer, provider, port, host = '127.0.0.1') {
    if (!port) {
      throw new Error('Please provide the port to connect to the Pact Mock Server.')
    }

    if (!consumer || !provider) {
      throw new Error('Please provide the names of the provider and consumer for this Pact.')
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
      .then((res) => console.log('Interaction added.'))
      .catch(handleError)
  }

  removeInteractions () {
    return request.del(`${this._baseURL}/interactions`)
      .set(MOCK_HEADERS)
      .then((res) => console.log('Interaction removed.'))
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
      .then((res) => console.log('Pact written.'))
      .catch(handleError)
  }

  verifyAndWrite () {
    return this.verify().then(() => {
      console.log('verification successful')
      this.writePact()
    })
  }
}
