'use strict'

import chai from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'
import wrapper from '@pact-foundation/pact-node'

chai.use(sinonChai)
chai.use(chaiAsPromised)

// used to kill any left over mock server instances
process.on('SIGINT', function () {
  wrapper.removeAllServers()
})
