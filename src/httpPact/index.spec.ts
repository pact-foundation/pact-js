import { vi } from 'vitest';
import type {
  ConsumerInteraction,
  ConsumerPact,
} from '@pact-foundation/pact-core';
import type { PactV2Options, PactV2OptionsComplete } from '../dsl/options';
import { Pact } from '.';
import type { MockService } from '../dsl/mockService';

describe('Pact', () => {
  const fullOpts = {
    consumer: 'A',
    provider: 'B',
    port: 1234,
    host: '127.0.0.1',
    ssl: false,
    logLevel: 'info',
    spec: 2,
    cors: false,
    pactfileWriteMode: 'merge',
  } as PactV2OptionsComplete;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#constructor', () => {
    it('throws Error when consumer not provided', () => {
      expect(() => {
        new Pact({ consumer: '', provider: 'provider' });
      }).toThrow('You must specify a Consumer for this pact.');
    });

    it('throws Error when provider not provided', () => {
      expect(() => {
        new Pact({ consumer: 'someconsumer', provider: '' });
      }).toThrow('You must specify a Provider for this pact.');
    });
  });

  describe('#createOptionsWithDefault', () => {
    const constructorOpts: PactV2Options = {
      consumer: 'A',
      provider: 'B',
    };

    it('merges options with sensible defaults', () => {
      const opts = Pact.createOptionsWithDefaults(constructorOpts);
      expect(opts.consumer).toBe('A');
      expect(opts.provider).toBe('B');
      expect(opts.cors).toBe(false);
      expect(opts.host).toBe('127.0.0.1');
      expect(opts.logLevel).toBe('info');
      expect(opts.spec).toBe(2);
      expect(opts.dir).toBeTruthy();
      expect(opts.log).toBeTruthy();
      expect(opts.pactfileWriteMode).toBe('merge');
      expect(opts.ssl).toBe(false);
      expect(opts.sslcert).toBeUndefined();
      expect(opts.sslkey).toBeUndefined();
    });
  });

  describe('#setup', () => {
    describe('when server is properly configured', () => {
      it('updates the mock service configuration', async () => {
        const p: Pact = new Pact(fullOpts);

        await p.setup();
        expect(p.mockService).toEqual({
          baseUrl: 'http://127.0.0.1:1234',
          pactDetails: {
            pactfile_write_mode: 'merge',
            consumer: {
              name: 'A',
            },
            provider: { name: 'B' },
          },
        });
      });

      it('returns the current configuration', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: accessing internal setup() method not in public type
        const p: any = new Pact(fullOpts);

        await expect(p.setup()).resolves.toMatchObject({
          consumer: 'A',
          provider: 'B',
          port: 1234,
          host: '127.0.0.1',
          ssl: false,
          logLevel: 'info',
          spec: 2,
          cors: false,
          pactfileWriteMode: 'merge',
        });
      });
    });

    describe('when a port is given', () => {
      it('checks if the port is available', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: accessing internal setup() method not in public type
        const p: any = new Pact(fullOpts);

        await expect(p.setup()).resolves.toHaveProperty('port', fullOpts.port);
      });
    });

    describe('when no port is given', () => {
      it('finds a free port', async () => {
        const opts = {
          ...fullOpts,
          port: undefined,
        };
        // biome-ignore lint/suspicious/noExplicitAny: accessing internal setup() method not in public type
        const p: any = new Pact(opts);

        await expect(p.setup()).resolves.toMatchObject({
          port: expect.anything(),
        });
      });
    });
  });

  describe('#addInteraction', () => {
    // This is more of an integration test, as the function has taken on a lot more
    // responsibility previously covered by other functions during the upgrade to
    // the rust core, to ensure the API remains backwards compatible
    it('sets the correct request and response details on the FFI and starts the mock server', () => {
      const p: Pact = new Pact(fullOpts);
      const uponReceiving = vi.fn().mockReturnValue(true);
      const given = vi.fn().mockReturnValue(true);
      const withRequest = vi.fn().mockReturnValue(true);
      const withRequestBody = vi.fn().mockReturnValue(true);
      const withRequestHeader = vi.fn().mockReturnValue(true);
      const withQuery = vi.fn().mockReturnValue(true);
      const withResponseBody = vi.fn().mockReturnValue(true);
      const withResponseHeader = vi.fn().mockReturnValue(true);
      const withStatus = vi.fn().mockReturnValue(true);
      const createMockServer = vi.fn().mockReturnValue(1234);
      const pactMock: ConsumerPact = {
        createMockServer,
      } as unknown as ConsumerPact;
      const interactionMock: ConsumerInteraction = {
        uponReceiving,
        given,
        withRequest,
        withRequestBody,
        withRequestHeader,
        withQuery,
        withResponseBody,
        withResponseHeader,
        withStatus,
      } as unknown as ConsumerInteraction;
      // @ts-expect-error TODO refactor the class to remove the need for this
      p.pact = pactMock;
      // @ts-expect-error: TODO refactor the class to remove the need for this
      p.interaction = interactionMock;
      p.mockService = {} as MockService;

      p.addInteraction({
        state: 'some state',
        uponReceiving: 'some description',
        withRequest: {
          method: 'GET',
          path: '/',
          body: { foo: 'bar' },
          headers: {
            'content-type': 'application/json',
            foo: 'bar',
          },
          query: {
            query: 'string',
            foo: 'bar',
          },
        },
        willRespondWith: {
          status: 200,
          body: { baz: 'bat' },
          headers: {
            'content-type': 'application/hal+json',
            foo: 'bar',
          },
        },
      });

      expect(uponReceiving).toHaveBeenCalledOnce();
      expect(given).toHaveBeenCalledOnce();
      expect(withRequest).toHaveBeenCalledOnce();
      expect(withQuery).toHaveBeenCalledTimes(2);
      expect(withRequestHeader).toHaveBeenCalledTimes(2);
      expect(withRequestBody).toHaveBeenCalledOnce();
      expect(withResponseBody).toHaveBeenCalledOnce();
      expect(withResponseHeader).toHaveBeenCalledTimes(2);

      // Pact mock server started
      expect(createMockServer).toHaveBeenCalled();
    });
  });
});
