import { vi } from 'vitest';
import type { Server } from 'node:http';
import serviceFactory, { type LogLevel } from '@pact-foundation/pact-core';

import logger from '../../common/logger';
import { Verifier } from './verifier';
import type { VerifierOptions } from './types';

const mockState = vi.hoisted(() => ({ executed: false }));

vi.mock('./proxy', () => ({
  createProxy: () =>
    ({
      close: () => {
        mockState.executed = true;
      },
      address: () => ({
        port: 1234,
        family: 'https',
        address: 'mock.server.example.com',
      }),
    }) as unknown as Server,
  waitForServerReady: () => Promise.resolve(),
}));

describe('Verifier', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockState.executed = false;
  });

  const state = 'thing exists';
  const providerBaseUrl = 'http://not.exists';
  const opts: VerifierOptions = {
    providerBaseUrl,
    requestFilter: (_req, _res, next) => {
      next();
    },
    stateHandlers: {
      [state]: () => {
        return Promise.resolve();
      },
    },
  };

  let v: Verifier;

  describe('#constructor', () => {
    describe('when given configuration', () => {
      it('sets the configuration on the object', () => {
        v = new Verifier(opts);

        expect(v).toHaveProperty('config.providerBaseUrl', providerBaseUrl);
        expect(v).toHaveProperty('config.stateHandlers');
        expect(v).toHaveProperty('config.requestFilter');
      });
    });
  });

  describe('options handling', () => {
    // biome-ignore lint/suspicious/noExplicitAny: spy type varies by method signature
    let spy: any;

    beforeEach(() => {
      spy = vi.spyOn(serviceFactory, 'logLevel');
    });

    describe('when logLevel is provided', () => {
      it('sets the log level on pact node', () => {
        v = new Verifier({
          ...opts,
          logLevel: 'debug',
        });
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    describe('when logLevel is not provided', () => {
      it('does not modify the log setting', () => {
        const { ...rest } = opts;
        v = new Verifier({
          ...rest,
        });
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
    describe('when a deprecated field is provided', () => {
      it('logs a warning', () => {
        spy = vi.spyOn(logger, 'warn');
        v = new Verifier({
          ...opts,
          providerStatesSetupUrl: 'http://foo.com',
        });

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('#verifyProvider', () => {
    beforeEach(() => {});

    describe('when no configuration has been given', () => {
      it('fails with an error', () =>
        expect(
          () => new Verifier(undefined as unknown as VerifierOptions),
        ).toThrow());
    });

    describe('when the verifier has been configured', () => {
      beforeEach(() => {
        v = new Verifier({ ...opts, logLevel: 'trace' as LogLevel });
      });
      describe('and the verification runs successfully', () => {
        it('closes the server and returns the result', async () => {
          vi.spyOn(v as any, 'runProviderVerification').mockReturnValue(
            Promise.resolve('done'),
          );

          const res = v.verifyProvider();

          await res;
          expect(mockState.executed).toBe(true);
        });
      });

      describe('and the verification fails', () => {
        it('closes the server and returns the result', async () => {
          vi.spyOn(v as any, 'runProviderVerification').mockReturnValue(() =>
            Promise.reject(new Error('error')),
          );

          const res = v.verifyProvider();

          await expect(res).rejects.toThrow();
          expect(mockState.executed).toBe(true);
        });
      });
    });
  });
});
