var sinon = require('sinon')
var expect = require('chai').expect
var proxyquire = require('proxyquire')

describe('Logger#info', () => {
  const consoleLogSpy = sinon.spy(console, 'log')

  context('with logging configuration turned on', () => {
    beforeEach(() => {
      consoleLogSpy.reset()
      var logger = proxyquire('../../src/common/logger', { './config': { logging: true } })
      logger.info('this will be logged')
    })

    it('logs a message', () => {
      expect(consoleLogSpy).to.have.been.calledWith('this will be logged')
    })
  })

  context('with logging configuration turned off', () => {
    beforeEach(() => {
      consoleLogSpy.reset()
      var logger = proxyquire('../../src/common/logger', { './config': { logging: false } })
      logger.info('this will be ignored')
    })

    it('ignores a message to be logged', function () {
      expect(consoleLogSpy).to.not.have.been.called
    })
  })
})
