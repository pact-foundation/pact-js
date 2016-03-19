'use strict'

import omitBy from 'lodash.omitby'
import isNil from 'lodash.isnil'

const VALID_METHODS = [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS' ]

export default class Interaction {

  constructor (providerState) {
    this.state = {}
    if (providerState) {
      this.state['state'] = providerState
    }
    return this
  }

  uponReceiving (description) {
    if (isNil(description)) {
      throw new Error('You must provide a description for the interaction.')
    }
    this.state['description'] = description
    return this
  }

  withRequest (method, path, ...other) {
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
      query: other[0] || undefined,
      headers: other[1] || undefined,
      body: other[2] || undefined
    }, isNil)
    return this
  }

  willRespondWith (status, ...other) {
    if (isNil(status) || status.toString().trim().length === 0) {
      throw new Error('You must provide a status code.')
    }

    this.state['response'] = omitBy({
      status: status,
      headers: other[0] || undefined,
      body: other[1] || undefined
    }, isNil)
    return this
  }

  json () {
    return this.state
  }
}
