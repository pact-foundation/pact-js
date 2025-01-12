import proxyquire from 'proxyquire';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { Server } from 'http';
import serviceFactory, { LogLevel } from '@pact-foundation/pact-core';

import logger from '../../common/logger';

import { VerifierOptions } from './types';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Verifier', () => {
  afterEach(() => {
    sinon.restore();
  });

  let executed: boolean;
  const state = 'thing exists';
  const providerBaseUrl = 'http://not.exists';
  const opts: VerifierOptions = {
    providerBaseUrl,
    requestFilter: (req, res, next) => {
      next();
    },
    stateHandlers: {
      [state]: () => {
        executed = true;
        return Promise.resolve();
      },
    },
  };

  // Mock the module and replace the proxy
  const { Verifier } = proxyquire('./verifier', {
    './proxy': {
      createProxy: () =>
        ({
          close: (): Server => {
            executed = true;
            return {} as Server;
          },
          address: () => ({
            port: 1234,
            family: 'https',
            address: 'mock.server.example.com',
          }),
        }) as Server,

      waitForServerReady: () => Promise.resolve(),
    },
  });

  let v: typeof Verifier;

  describe('#constructor', () => {
    describe('when given configuration', () => {
      it('sets the configuration on the object', () => {
        v = new Verifier(opts);

        expect(v).to.have.deep.property('config').includes({
          providerBaseUrl,
        });
        expect(v).to.have.nested.property('config.stateHandlers');
        expect(v).to.have.nested.property('config.requestFilter');
      });
    });
  });

  describe('options handling', () => {
    let spy: sinon.SinonSpy;

    beforeEach(() => {
      spy = sinon.spy(serviceFactory, 'logLevel');
    });

    context('when logLevel is provided', () => {
      it('sets the log level on pact node', () => {
        v = new Verifier({
          ...opts,
          logLevel: 'debug',
        });
        expect(spy.callCount).to.eql(1);
      });
    });

    context('when logLevel is not provided', () => {
      it('does not modify the log setting', () => {
        const { ...rest } = opts;
        v = new Verifier({
          ...rest,
        });
        expect(spy.callCount).to.eql(0);
      });
    });
    context('when a deprecated field is provided', () => {
      it('logs a warning', () => {
        spy = sinon.spy(logger, 'warn');
        v = new Verifier({
          ...opts,
          providerStatesSetupUrl: 'http://foo.com',
        });

        expect(spy.callCount).to.eql(1);
      });
    });
  });

  describe('#verifyProvider', () => {
    beforeEach(() => {});

    describe('when no configuration has been given', () => {
      it('fails with an error', () =>
        expect(
          () => new Verifier(undefined as unknown as VerifierOptions)
        ).to.throw());
    });

    describe('when the verifier has been configured', () => {
      beforeEach(() => {
        v = new Verifier({ ...opts, logLevel: 'trace' as LogLevel });
      });
      context('and the verification runs successfully', () => {
        it('closes the server and returns the result', () => {
          sinon
            .stub(v, 'runProviderVerification' as any)
            .returns(Promise.resolve('done'));

          const res = v.verifyProvider();

          return expect(res).to.eventually.be.fulfilled.then(() => {
            expect(executed).to.be.true;
          });
        });
      });

      context('and the verification fails', () => {
        it('closes the server and returns the result', () => {
          sinon
            .stub(v, 'runProviderVerification' as any)
            .returns(() => Promise.reject(new Error('error')));

          const res = v.verifyProvider();

          return expect(res).to.eventually.be.rejected.then(() => {
            expect(executed).to.be.true;
          });
        });
      });
    });
  });
});
