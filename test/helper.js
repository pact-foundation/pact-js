'use strict'

var chai = require('chai')
var sinonChai = require('sinon-chai')
var chaiAsPromised = require('chai-as-promised')
var wrapper = require('@pact-foundation/pact-node')

chai.use(sinonChai)
chai.use(chaiAsPromised)

// used to kill any left over mock server instances
process.on('SIGINT', function () {
  wrapper.removeAllServers()
})
