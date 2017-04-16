const sinon = require('sinon')
const logger = require('../../src/common/logger')
const net = require('../../src/common/net')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect

chai.use(chaiAsPromised)
var port = 1234

describe('Net#isPortAvailable', () => {
  context('when the port is not allowed to be bound', () => {
    it('should return a rejected promise', () => {
      expect(net.isPortAvailable(80, '0.0.0.0')).to.eventually.be.rejected
    })
  })

  context('when the port is available', () => {
    it('should return a fulfilled promise', () => {
      expect(net.isPortAvailable(port, '0.0.0.0')).to.eventually.be.fulfilled
    })
  })

  context('when the port is unavailable', () => {
    it('should return a rejected promise', (done) => {
      createServer(port).then((server) => {
        net.isPortAvailable(port, '0.0.0.0')
          .then(() => {
            server.close()
            done(new Error(`Port ${port} should not be available`))
          }, e => {
            done()
          })
      })
    })
  })
})

// Utility function to create a server on a given port and return a Promise
const createServer = (port) => new Promise((resolve, reject) => {
  const net = require('net')
  const server = net.createServer()

  server.on('error', (err) => reject(err))
  server.on('listening', () => resolve(server))

  server.listen(port, () => {
    logger.info(`test server is up on port ${port}`);
  })
})
