/**
 * A Mock Service is the interaction mechanism through which pacts get written and verified.
 * This should be transparent to the end user.
 * @module MockService
 */

'use strict'

const isNil = require('lodash.isnil')
const Request = require('../common/request')

module.exports = class MockService {

  /**
   * @param {string} consumer - the consumer name
   * @param {string} provider - the provider name
   * @param {number} port - the mock service port, defaults to 1234
   * @param {string} host - the mock service host, defaults to 127.0.0.1
   * @param {boolean} ssl - which protocol to use, defaults to false (HTTP)
   */
  constructor (consumer, provider, port, host, ssl) {
    if (isNil(consumer) || isNil(provider)) {
      throw new Error('Please provide the names of the provider and consumer for this Pact.')
    }

    port = port || 1234
    host = host || '127.0.0.1'
    ssl = ssl || false

    this._request = new Request()
    this._baseURL = `${ssl ? 'https' : 'http'}://${host}:${port}`
    this._pactDetails = {
      consumer: { name: consumer },
      provider: { name: provider }
    }
  }

  /**
   * Adds an interaction
   * @param {Interaction} interaction
   * @returns {Promise}
   */
  addInteraction (interaction) {
    const stringifiedInteraction = JSON.stringify(interaction.json())
    return this._request.send('POST', `${this._baseURL}/interactions`, stringifiedInteraction)
  }

  /**
   * Removes all interactions.
   * @returns {Promise}
   */
  removeInteractions () {
    return this._request.send('DELETE', `${this._baseURL}/interactions`)
  }

  /**
   * Verify all interactions.
   * @returns {Promise}
   */
  verify () {
    return this._request.send('GET', `${this._baseURL}/interactions/verification`)
  }

  /**
   * Writes the Pact file.
   * @returns {Promise}
   */
  writePact () {
    const stringifiedPactDetails = JSON.stringify(this._pactDetails)
    return this._request.send('POST', `${this._baseURL}/pact`, stringifiedPactDetails)
  }

}
