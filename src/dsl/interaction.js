/**
 * An Interaction is where you define the state of your interaction with a Provider.
 * @module Interaction
 */

'use strict'

const omitBy = require('lodash.omitby')
const isNil = require('lodash.isnil')

const VALID_METHODS = [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS' ]

module.exports = class Interaction {

  /**
   * Creates a new Interaction.
   * @returns {Interaction} interaction
   */
  constructor () {
    this.state = {}
    return this
  }

  /**
   * Gives a state the provider should be in for this interaction.
   * @param {string} providerState - The state of the provider.
   * @returns {Interaction} interaction
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
   * @returns {Interaction} interaction
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
   * @param {Object} requestOpts
   * @param {string} requestOpts.method - The HTTP method
   * @param {string} requestOpts.path - The path of the URL
   * @param {string} requestOpts.query - Any query string in the interaction
   * @param {Object} requestOpts.headers - A key-value pair oject of headers
   * @param {Object} requestOpts.body - The body, in {@link String} format or {@link Object} format
   * @returns {Interaction} interaction
   */
  withRequest (requestOpts) {
    var method = requestOpts.method
    var path = requestOpts.path
    var query = requestOpts.query
    var headers = requestOpts.headers
    var body = requestOpts.body

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
  * @param {Object} responseOpts
  * @param {string} responseOpts.status - The HTTP status
  * @param {string} responseOpts.headers
  * @param {Object} responseOpts.body
   */
  willRespondWith (responseOpts) {
    var status = responseOpts.status
    var headers = responseOpts.headers
    var body = responseOpts.body

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
