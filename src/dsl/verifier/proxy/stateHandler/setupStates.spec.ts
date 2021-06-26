import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import logger from '../../../../common/logger';
import { ProxyOptions, ProviderState } from '../types';

import { setupStates } from './setupStates';
import { JsonMap } from '../../../../common/jsonTypes';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('#setupStates', () => {
  const state: ProviderState = {
    state: 'thing exists',
    action: 'setup',
    params: {},
  };
  const state2: ProviderState = {
    state: 'another thing exists',
    action: 'setup',
    params: {
      id: 1,
    },
  };
  const providerBaseUrl = 'http://not.exists';
  let executed: boolean;
  let setup: boolean;
  let teardown: boolean;

  const DEFAULT_OPTIONS = (): ProxyOptions => ({
    providerBaseUrl,
    requestFilter: (req, res, next) => {
      next();
    },
    stateHandlers: {
      [state.state]: () => {
        executed = true;
        return Promise.resolve({});
      },
      [state2.state]: {
        setup: (params) => {
          setup = true;
          return Promise.resolve(params as JsonMap);
        },
        teardown: (params) => {
          teardown = true;
          return Promise.resolve(params as JsonMap);
        },
      },
    },
  });

  let opts: ProxyOptions;

  beforeEach(() => {
    opts = DEFAULT_OPTIONS();
    executed = false;
    setup = false;
    teardown = false;
  });

  describe('when there are provider states on the pact', () => {
    describe('and there are handlers associated with those states', () => {
      describe('that return provider state injected values', () => {
        it('executes the handler and returns the data', async () => {
          opts.stateHandlers = {
            [state.state]: () => {
              executed = true;
              return Promise.resolve({ data: true });
            },
          };
          const res = await setupStates(state, opts);

          expect(res).to.have.property('data', true);
          expect(executed).to.be.true;
        });
      });
      describe('that do not return a value', () => {
        it('executes the handler and returns an empty Promise', async () => {
          await setupStates(state, opts);

          expect(executed).to.be.true;
        });
      });
      describe('that specify a setup and teardown function', () => {
        it('executes the lifecycle specific handler and returns any provider state injected values', async () => {
          const res = await setupStates(state2, opts);

          expect(res).to.eq(state2.params);
          expect(setup).to.be.true;
          expect(teardown).to.be.false;
          setup = false;

          const res2 = await setupStates(
            {
              ...state2,
              action: 'teardown',
            },
            opts
          );

          expect(res2).to.eq(state2.params);
          expect(teardown).to.be.true;
          expect(setup).to.be.false;
        });
      });
    });

    describe('and there are no handlers associated with those states', () => {
      it('does not execute the handler and returns an empty Promise', async () => {
        const spy = sinon.spy(logger, 'warn');
        delete opts.stateHandlers;
        await setupStates(state, opts);

        expect(spy.callCount).to.eql(1);
        expect(executed).to.be.false;
      });
    });
  });
});
