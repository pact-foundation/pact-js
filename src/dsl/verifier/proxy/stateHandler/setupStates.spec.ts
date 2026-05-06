import { vi } from 'vitest';

import logger from '../../../../common/logger';
import type { ProxyOptions, ProviderState } from '../types';

import { setupStates } from './setupStates';
import type { JsonMap } from '../../../../common/jsonTypes';

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
    requestFilter: (_req, _res, next) => {
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

  afterEach(() => {
    vi.restoreAllMocks();
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

          expect(res).toHaveProperty('data', true);
          expect(executed).toBe(true);
        });
      });

      describe('that do not return a value', () => {
        it('executes the handler and returns an empty Promise', async () => {
          await setupStates(state, opts);

          expect(executed).toBe(true);
        });
      });

      describe('that specify a setup and teardown function', () => {
        it('executes the lifecycle specific handler and returns any provider state injected values', async () => {
          const res = await setupStates(state2, opts);

          expect(res).toBe(state2.params);
          expect(setup).toBe(true);
          expect(teardown).toBe(false);
          setup = false;

          const res2 = await setupStates(
            {
              ...state2,
              action: 'teardown',
            },
            opts,
          );

          expect(res2).toBe(state2.params);
          expect(teardown).toBe(true);
          expect(setup).toBe(false);
        });
      });
    });

    describe('and there are no handlers associated with those states', () => {
      it('does not execute the handler and returns an empty Promise', async () => {
        const spy = vi.spyOn(logger, 'warn');
        delete opts.stateHandlers;
        await setupStates(state, opts);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(executed).toBe(false);
      });
    });
  });
});
