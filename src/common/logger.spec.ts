import * as sinon from 'sinon';
import { expect } from 'chai';
import * as  proxyquire from 'proxyquire';

describe('Logger#info', () => {
  const consoleLogSpy = sinon.spy(console, 'log');

  context('with logging configuration turned on', () => {
    beforeEach(() => {
      consoleLogSpy.reset();
      const logger = proxyquire('./logger', { './config': { config: { logging: true } } }).logger;
      logger.info('this will be logged');
    });

    it('logs a message', () => {
      expect(consoleLogSpy).to.have.been.calledWith('this will be logged');
    });
  });

  context('with logging configuration turned off', () => {
    beforeEach(() => {
      consoleLogSpy.reset();
      const logger = proxyquire('./logger', { './config': { config: { logging: false } } }).logger;
      logger.info('this will be ignored');
    });

    it('ignores a message to be logged', () => {
      expect(consoleLogSpy).to.not.have.been.called;
    });
  });
});
