import type { Server } from 'node:http';
import serviceFactory, { type LogLevel } from '@pact-foundation/pact-core';
import { vi } from 'vitest';

import logger from '../../common/logger';
import type { VerifierOptions } from './types';
import { Verifier } from './verifier';

const mockState = vi.hoisted(() => ({ executed: false }));

vi.mock('./proxy', () => ({
  createHooksState: () => ({ insideInteraction: false, errors: [] }),
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
  waitForServerReady: (server: Server) => Promise.resolve(server),
}));

describe('Verifier', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    mockState.executed = false;
  });

  const state = 'thing exists';
  const providerBaseUrl = 'http://not.exists';
  const opts: VerifierOptions = {
    providerBaseUrl,
    pactUrls: ['pact.json'],
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

      it('accepts state handlers with separate setup and teardown functions', () => {
        const stateHandler = {
          setup: vi.fn(async () => {}),
          teardown: vi.fn(async () => {}),
        };

        v = new Verifier({
          providerBaseUrl,
          stateHandlers: {
            [state]: stateHandler,
          },
        });

        expect(v).toHaveProperty(`config.stateHandlers.${state}`, stateHandler);
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

    it.each([
      { label: 'omitted pactUrls', pactUrls: undefined },
      { label: 'empty pactUrls', pactUrls: [] },
    ])('rejects $label without a broker before running verification', async ({
      pactUrls,
    }) => {
      vi.stubEnv('PACT_BROKER_BASE_URL', undefined);
      const verifyPacts = vi
        .spyOn(serviceFactory, 'verifyPacts')
        .mockResolvedValue('done');
      v = new Verifier({ ...opts, pactUrls });

      await expect(v.verifyProvider()).rejects.toThrow(
        'pactUrls or pactBrokerUrl',
      );
      expect(verifyPacts).not.toHaveBeenCalled();
    });

    it('accepts a broker source supplied through the environment', async () => {
      vi.stubEnv('PACT_BROKER_BASE_URL', 'https://broker.example.test');
      const verifyPacts = vi
        .spyOn(serviceFactory, 'verifyPacts')
        .mockResolvedValue('done');
      v = new Verifier({ ...opts, pactUrls: undefined, provider: 'Provider' });

      await expect(v.verifyProvider()).resolves.toEqual('done');
      expect(verifyPacts).toHaveBeenCalledTimes(1);
    });

    it('accepts an explicitly configured broker source', async () => {
      vi.stubEnv('PACT_BROKER_BASE_URL', undefined);
      const verifyPacts = vi
        .spyOn(serviceFactory, 'verifyPacts')
        .mockResolvedValue('done');
      v = new Verifier({
        ...opts,
        pactUrls: undefined,
        pactBrokerUrl: 'https://broker.example.test',
        provider: 'Provider',
      });

      await expect(v.verifyProvider()).resolves.toEqual('done');
      expect(verifyPacts).toHaveBeenCalledTimes(1);
    });

    it('rejects an environment broker source without a provider name', async () => {
      vi.stubEnv('PACT_BROKER_BASE_URL', 'https://broker.example.test');
      const verifyPacts = vi
        .spyOn(serviceFactory, 'verifyPacts')
        .mockResolvedValue('done');
      v = new Verifier({ ...opts, pactUrls: undefined });

      await expect(v.verifyProvider()).rejects.toThrow(
        "'provider' is required",
      );
      expect(verifyPacts).not.toHaveBeenCalled();
    });

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
          vi.spyOn(
            v as unknown as { runProviderVerification: () => unknown },
            'runProviderVerification',
          ).mockReturnValue(Promise.resolve('done'));

          const res = v.verifyProvider();

          await res;
          expect(mockState.executed).toBe(true);
        });
      });

      describe('and the verification fails', () => {
        it('closes the server and returns the result', async () => {
          vi.spyOn(
            v as unknown as { runProviderVerification: () => unknown },
            'runProviderVerification',
          ).mockReturnValue(() => Promise.reject(new Error('error')));

          const res = v.verifyProvider();

          await expect(res).rejects.toThrow();
          expect(mockState.executed).toBe(true);
        });
      });

      it('does not pass TLS client credentials to pact-core', async () => {
        const verifyPacts = vi
          .spyOn(serviceFactory, 'verifyPacts')
          .mockResolvedValue('done');
        v = new Verifier({
          ...opts,
          tlsClientOptions: {
            pfx: Buffer.from('certificate'),
            passphrase: 'secret',
          },
        });

        await v.verifyProvider();

        expect(verifyPacts).toHaveBeenCalledWith(
          expect.not.objectContaining({ tlsClientOptions: expect.anything() }),
        );
      });
    });
  });
});
