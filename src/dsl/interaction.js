'use strict'

import omitBy from 'lodash.omitby'
import isNil from 'lodash.isnil'

const VALID_METHODS = [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS' ]

/**
 * An Interaction is where you define the state of your interaction with a Provider.
 */
export default class Interaction {

  /**
   * Creates a new Interaction.
   */
  constructor () {
    this.state = {}
    return this
  }

  /**
   * Gives a state the provider should be in for this interaction.
   * @param {string} providerState - The state of the provider.
   * @returns {Interaction}
   */
  given (providerState) {
    if (providerState) {
      this.state['provider_state'] = providerState
    }
    return this
  }

  /**
   * A free style description of the interaction.
   * @param {string} description - A description of the interaction.
   * @returns {Interaction}
   */
  uponReceiving (description) {
    if (isNil(description)) {
      throw new Error('You must provide a description for the interaction.')
    }
    this.state['description'] = description
    return this
  }

  /**
   * The request that represents this interaction triggered by the consumer.
   * @param {string} method - The HTTP method
   * @param {string} path - The path of the URL
   * @param {string} qs
   * @param {string} headers
   * @param {string} body
   * @returns {Interaction}
   */
  withRequest ({ method, path, query, headers, body }) {
    if (isNil(method)) {
      throw new Error('You must provide a HTTP method.')
    }

    if (VALID_METHODS.indexOf(method.toUpperCase()) < 0) {
      throw new Error('You must provide a valid HTTP method.')
    }

    if (isNil(path)) {
      throw new Error('You must provide a path.')
    }

    this.state['request'] = omitBy({
      method: method.toUpperCase(),
      path: path,
      query: query,
      headers: headers,
      body: body
    }, isNil)
    return this
  }

  /**
  * The response expected by the consumer.
  * @param {string} status - The HTTP status
  * @param {string} headers
  * @param {string} body
   */
  willRespondWith ({ status, headers, body }) {
    if (isNil(status) || status.toString().trim().length === 0) {
      throw new Error('You must provide a status code.')
    }

    this.state['response'] = omitBy({
      status: status,
      headers: headers || undefined,
      body: body || undefined
    }, isNil)
  }

  /**
   * Returns the interaction object created.
   * @returns {Object}
   */
  json () {
    return this.state
  }
}
