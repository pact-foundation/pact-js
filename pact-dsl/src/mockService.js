'use strict'

import clone from 'lodash.clone'
import isNil from 'lodash.isnil'
import request from 'superagent'
import { Promise } from 'es6-promise'
import { logger } from './logger'

const MOCK_HEADERS = {
  'Content-Type': 'application/json',
  'X-Pact-Mock-Service': 'true'
}

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
    return new Promise((resolve, reject) => {
      request.post(`${this._baseURL}/interactions`)
        .set(MOCK_HEADERS)
        .send(stringifiedInteraction)
        .end((err, data) => {
          if (err) {
            reject(err)
            return
          }
          logger.info(`Interaction added: "${stringifiedInteraction}"`)
          resolve()
        })
    })
  }

  putInteractions (interactions) {
    const clonedInteractions = interactions.map((interaction) => clone(interaction).json())
    const stringifiedInteractions = JSON.stringify({interactions: clonedInteractions})
    return new Promise((resolve, reject) => {
      request.put(`${this._baseURL}/interactions`)
        .set(MOCK_HEADERS)
        .send(stringifiedInteractions)
        .end((err, data) => {
          if (err) {
            reject(err)
            return
          }
          logger.info(`Set of interactions added: "${stringifiedInteractions}"`)
          resolve()
        })
    })
  }

  removeInteractions () {
    return new Promise((resolve, reject) => {
      request.del(`${this._baseURL}/interactions`)
        .set(MOCK_HEADERS)
        .end((err, data) => {
          if (err) {
            reject(err)
            return
          }
          logger.info('All interactions removed.')
          resolve()
        })
    })
  }

  verify () {
    return new Promise((resolve, reject) => {
      request.get(`${this._baseURL}/interactions/verification`)
        .set(MOCK_HEADERS)
        .end((err, data) => {
          if (err) {
            reject(err)
            return
          }
          logger.info('Verification successful.')
          resolve()
        })
    })
  }

  writePact () {
    const stringifiedPactDetails = JSON.stringify(this._pactDetails)
    return new Promise((resolve, reject) => {
      request.post(`${this._baseURL}/pact`)
        .set(MOCK_HEADERS)
        .send(stringifiedPactDetails)
        .end((err, data) => {
          if (err) {
            reject(err)
            return
          }
          logger.info(`Pact successfully written with: ${stringifiedPactDetails}`)
          resolve()
        })
    })
  }

  verifyAndWrite () {
    return this.verify().then(() => this.writePact()).then(() => logger.info('Matchers verified and Pact written.'))
  }
}
