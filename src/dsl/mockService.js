/**
 * Mock Service is the HTTP interface to setup the Pact Mock Service.
 * See https://github.com/bethesque/pact-mock_service and
 * https://gist.github.com/bethesque/9d81f21d6f77650811f4.
 * @module MockService
 */

'use strict'

const isNil = require('lodash.isnil')
const Request = require('../common/request')
const logger = require('../common/logger')

module.exports = class MockService {

  /**
   * @param {string} consumer - the consumer name
   * @param {string} provider - the provider name
   * @param {number} port - the mock service port, defaults to 1234
   * @param {string} host - the mock service host, defaults to 127.0.0.1
   * @param {boolean} ssl - which protocol to use, defaults to false (HTTP)
   * @param {string} pactfileWriteMode - 'overwrite' | 'update' | 'none', defaults to 'overwrite'
   */
  constructor (consumer, provider, port, host, ssl, pactfileWriteMode) {
    if (isNil(consumer) || isNil(provider)) {
      logger.warn('Warning: Consumer\\Provider details not provided, ensure ' +
        'that the mock service has been started with this information')
    }

    port = port || 1234
    host = host || '127.0.0.1'
    ssl = ssl || false
    pactfileWriteMode = pactfileWriteMode || 'overwrite'

    this._request = new Request()
    this._baseURL = `${ssl ? 'https' : 'http'}://${host}:${port}`
    this._pactDetails = {
      pactfile_write_mode: pactfileWriteMode,
      consumer: (consumer) ? { name: consumer } : undefined,
      provider: (provider) ? { name: provider } : undefined
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
