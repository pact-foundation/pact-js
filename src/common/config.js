/**
 * Configuration module.
 * @module config
 * @private
 */

'use strict'

const resolve = require('path').resolve

const PACT_CONFIG_FILE = resolve(process.cwd(), 'config', 'pact.config.js')
const PACT_CONFIG = {
  mockService: {
    host: '127.0.0.1',
    port: 1234
  },
  logging: false
}

try {
  module.exports = require(PACT_CONFIG_FILE)
} catch (e) {
  module.exports = PACT_CONFIG
}
