/**
 * Provider Verifier service
 * @module ProviderVerifier
 */

'use strict'

const serviceFactory = require('@pact-foundation/pact-node')

module.exports.verifyProvider = (opts) => {
  return serviceFactory.verifyPacts(opts)
}
