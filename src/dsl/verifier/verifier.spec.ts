import type { Server } from 'node:http';
import serviceFactory, { type LogLevel } from '@pact-foundation/pact-core';
import { vi } from 'vitest';

import logger from '../../common/logger';
import { ProviderVerificationError } from './result';
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

      describe('#verify', () => {
        const resultJson = (result: boolean) =>
          JSON.stringify({
            result,
            notices: [],
            output: [],
            errors: result
              ? []
              : [
                  {
                    interaction: 'Verifying a pact between C and P - one',
                    mismatch: {
                      type: 'error',
                      message: 'boom',
                      interactionId: '',
                    },
                  },
                ],
            pendingErrors: [],
            interactionResults: [
              {
                description: 'one',
                result: result ? 'OK' : 'Error',
                duration: '1ms',
              },
            ],
          });

        it('resolves with the structured result of a successful run', async () => {
          vi.spyOn(serviceFactory, 'verifyPacts').mockResolvedValue(
            resultJson(true),
          );

          const result = await v.verify();

          expect(result.success).toBe(true);
          expect(result.interactions).toEqual([
            {
              description: 'one',
              pending: false,
              success: true,
              duration: '1ms',
            },
          ]);
          expect(mockState.executed).toBe(true);
        });

        it('rejects with a ProviderVerificationError carrying the result of a failed run', async () => {
          vi.spyOn(serviceFactory, 'verifyPacts').mockRejectedValue(
            new Error(resultJson(false)),
          );

          const error = await v.verify().catch((e) => e);

          expect(error).toBeInstanceOf(ProviderVerificationError);
          expect(error.message).toContain('C -> P: one');
          expect(error.result.success).toBe(false);
          expect(error.result.interactions[0]).toMatchObject({
            consumer: 'C',
            provider: 'P',
            success: false,
            failure: { type: 'error', message: 'boom' },
          });
          expect(mockState.executed).toBe(true);
        });

        it('rethrows errors that are not a verification result', async () => {
          vi.spyOn(serviceFactory, 'verifyPacts').mockRejectedValue(
            new Error('Pact core crashed'),
          );

          await expect(v.verify()).rejects.toThrow('Pact core crashed');
        });

        it('rejects the output of pact-core versions without JSON results', async () => {
          vi.spyOn(serviceFactory, 'verifyPacts').mockResolvedValue(
            'finished: 0',
          );

          await expect(v.verify()).rejects.toThrow(/pact-core >= 19/);
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
