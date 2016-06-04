import sinon from 'sinon'
import rewire from 'rewire'
import { expect } from 'chai'

const logger = rewire('../../src/common/logger')

describe('Logger#info', () => {
  const consoleLogSpy = sinon.spy(console, 'log')

  context('with logging configuration turned on', () => {
    beforeEach(() => {
      consoleLogSpy.reset()
      logger.__set__('config', { logging: true })
      logger.info('this will be logged')
    })

    it('logs a message', () => {
      expect(consoleLogSpy).to.have.been.calledWith('this will be logged');
    });
  })

  context('with logging configuration turned off', () => {
    beforeEach(() => {
      consoleLogSpy.reset()
      logger.__set__('config', { logging: false })
      logger.info('this will be ignored')
    })

    it('ignores a message to be logged', function () {
      expect(consoleLogSpy).to.not.have.been.called;
    });
  })
});
