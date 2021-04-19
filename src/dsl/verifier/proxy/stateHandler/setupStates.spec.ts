import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import logger from '../../../../common/logger';
import { ProxyOptions } from '../types';

import { setupStates } from './setupStates';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('#setupStates', () => {
  const state = 'thing exists';
  const providerBaseUrl = 'http://not.exists';
  let executed: boolean;

  const DEFAULT_OPTIONS = (): ProxyOptions => ({
    providerBaseUrl,
    requestFilter: (req, res, next) => {
      next();
    },
    stateHandlers: {
      [state]: () => {
        executed = true;
        return Promise.resolve('done');
      },
    },
  });

  let opts: ProxyOptions;

  beforeEach(() => {
    opts = DEFAULT_OPTIONS();
    executed = false;
  });

  describe('when there are provider states on the pact', () => {
    describe('and there are handlers associated with those states', () => {
      it('executes the handler and returns a set of Promises', async () => {
        const res = await setupStates(
          {
            states: [state],
          },
          opts
        );

        expect(res).lengthOf(1);
        expect(executed).to.be.true;
      });
    });

    describe('and there are no handlers associated with those states', () => {
      it('executes the handler and returns an empty Promise', async () => {
        const spy = sinon.spy(logger, 'warn');
        delete opts.stateHandlers;
        const res = await setupStates(
          {
            states: [state],
          },
          opts
        );

        expect(res).lengthOf(0);
        expect(spy.callCount).to.eql(1);
        expect(executed).to.be.false;
      });
    });
  });

  describe('when there are no provider states on the pact', () => {
    it('executes the handler and returns an empty Promise', async () => {
      const res = await setupStates({}, opts);

      expect(res).lengthOf(0);
    });
  });
});
