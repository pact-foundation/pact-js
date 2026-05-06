import { vi } from 'vitest';

import type express from 'express';

import { createProxyStateHandler } from './stateHandler';
import type { ProxyOptions, StateHandlers } from '../types';

describe('#createProxyStateHandler', () => {
  const state = {
    state: 'thing exists',
    action: 'setup',
  };

  let res: number;
  const mockResponse = {
    status: (status: number) => {
      res = status;
      return {
        send: () => {},
      };
    },
    json: (data: unknown) => data,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when valid state handlers are provided', () => {
    it('returns a 200', async () => {
      const stateHandlers = {
        'thing exists': () => Promise.resolve(),
      };

      const h = createProxyStateHandler({
        stateHandlers,
      } as ProxyOptions);
      await h(
        {
          body: state,
        } as express.Request,
        mockResponse as express.Response,
      );
    });
  });

  describe('when there is a problem with a state handler', () => {
    const badStateHandlers: StateHandlers = {
      'thing exists': {
        setup: () => Promise.reject(new Error('bad')),
      },
    };

    it('returns a 200 and logs an error', async () => {
      const spy = vi.spyOn(console, 'log');
      const h = createProxyStateHandler({
        stateHandlers: badStateHandlers,
      } as ProxyOptions);
      await h(
        {
          body: state,
        } as express.Request,
        mockResponse as express.Response,
      );

      expect(res).toBe(200);
      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy.mock.calls[0][0]).toContain(
        "Error executing state handler for state 'thing exists' on 'setup'.",
      );
    });
  });
});
