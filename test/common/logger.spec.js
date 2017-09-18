var sinon = require('sinon')
var expect = require('chai').expect
var proxyquire = require('proxyquire')

describe('Logger#info', () => {
  const consoleLogSpy = sinon.spy(console, 'log')
  const consoleWarnSpy = sinon.spy(console, 'warn')

  context('with logging configuration turned on', () => {
    beforeEach(() => {
      consoleLogSpy.reset()
      consoleWarnSpy.reset()
      var logger = proxyquire('../../src/common/logger', { './config': { logging: true } })
      logger.info('this will be logged')
      logger.warn('this will be logged at warn')
    })

    it('logs a message', () => {
      expect(consoleLogSpy).to.have.been.calledWith('this will be logged')
      expect(consoleWarnSpy).to.have.been.calledWith('this will be logged at warn')
    })
  })

  context('with logging configuration turned off', () => {
    beforeEach(() => {
      consoleLogSpy.reset()
      consoleWarnSpy.reset()
      var logger = proxyquire('../../src/common/logger', { './config': { logging: false } })
      logger.info('this will be ignored')
      logger.warn('this will be logged at warn')
    })

    it('ignores a message to be logged', function () {
      expect(consoleLogSpy).to.not.have.been.called
      expect(consoleWarnSpy).to.not.have.been.called
    })
  })
})
