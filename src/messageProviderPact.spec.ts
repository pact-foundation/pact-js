import http from 'node:http';
import express from 'express';
import type { Message } from './dsl/message';
import {
  MessageProviderPact,
  setupProxyServer,
  waitForServerReady,
} from './messageProviderPact';

describe('MessageProvider', () => {
  let provider: MessageProviderPact;
  const successfulRequest = 'successfulRequest';
  const unsuccessfulRequest = 'unsuccessfulRequest';

  const successfulMessage: Message = {
    contents: { foo: 'bar' },
    description: successfulRequest,
    providerStates: [{ name: 'some state' }],
  };

  const unsuccessfulMessage: Message = {
    contents: { foo: 'bar' },
    description: unsuccessfulRequest,
    providerStates: [{ name: 'some state not found' }],
  };
  const nonExistentMessage: Message = {
    contents: { foo: 'bar' },
    description: 'does not exist',
    providerStates: [{ name: 'some state not found' }],
  };

  beforeEach(() => {
    provider = new MessageProviderPact({
      logLevel: 'error',
      messageProviders: {
        successfulRequest: () => Promise.resolve('yay'),
        unsuccessfulRequest: () => Promise.reject(new Error('nay')),
      },
      provider: 'myprovider',
      stateHandlers: {
        'some state': () => Promise.resolve('yay'),
        'some state with params': (name, params) =>
          Promise.resolve(`name: ${name}, params: ${JSON.stringify(params)}`),
      },
    });
  });

  describe('#constructor', () => {
    it('creates a Provider when all mandatory parameters are provided', () => {
      expect(provider).toBeTypeOf('object');
      expect(typeof provider.verify).toBe('function');
    });

    it('creates a Provider with default log level if not specified', () => {
      provider = new MessageProviderPact({
        messageProviders: {},
        provider: 'myprovider',
      });
      expect(provider).toBeTypeOf('object');
      expect(typeof provider.verify).toBe('function');
    });
  });

  describe('#setupVerificationHandler', () => {
    describe('when their is a valid setup', () => {
      it('creates a valid express handler', () => {
        return new Promise<void>((resolve) => {
          const setupVerificationHandler =
            // biome-ignore lint/suspicious/noExplicitAny: accessing private method for test coverage
            (provider as any).setupVerificationHandler.bind(provider)();
          const req = { body: successfulMessage };
          const res = {
            json: () => resolve(),
          };

          setupVerificationHandler(req, res);
        });
      });
    });

    describe('when their is an invalid setup', () => {
      it('creates a valid express handler that rejects the message', () => {
        return new Promise<void>((resolve) => {
          const setupVerificationHandler =
            // biome-ignore lint/suspicious/noExplicitAny: accessing private method for test coverage
            (provider as any).setupVerificationHandler.bind(provider)();
          const req = { body: nonExistentMessage };
          const res = {
            status: (status: number) => {
              expect(status).toBe(500);

              return {
                send: () => resolve(),
              };
            },
          };

          setupVerificationHandler(req, res);
        });
      });
    });
  });

  describe('#findHandler', () => {
    describe('when given a handler that exists', () => {
      it('returns a Handler object', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: accessing private method for test coverage
        const findHandler = (provider as any).findHandler.bind(provider);
        await expect(findHandler(successfulMessage)).resolves.toBeTypeOf(
          'function',
        );
      });
    });

    describe('when given a handler that does not exist', () => {
      it('returns a failed promise', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: accessing private method for test coverage
        const findHandler = (provider as any).findHandler.bind(provider);
        await expect(findHandler('doesnotexist')).rejects.toBeDefined();
      });
    });
  });

  describe('#setupStates', () => {
    describe('when given a handler that exists', () => {
      it('returns values of all resolved handlers', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: accessing private method for test coverage
        const setupStates = (provider as any).setupStates.bind(provider);
        await expect(setupStates(successfulMessage)).resolves.toEqual(['yay']);
      });

      it('passes params to the handler', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: accessing private method for test coverage
        const setupStates = (provider as any).setupStates.bind(provider);
        await expect(
          setupStates({
            providerStates: [
              { name: 'some state with params', params: { foo: 'bar' } },
            ],
          }),
        ).resolves.toEqual([
          'name: some state with params, params: {"foo":"bar"}',
        ]);
      });
    });

    describe('when given a state that does not have a handler', () => {
      it('returns an empty promise', async () => {
        provider = new MessageProviderPact({
          messageProviders: {},
          provider: 'myprovider',
        });
        // biome-ignore lint/suspicious/noExplicitAny: accessing private method for test coverage
        const findStateHandler = (provider as any).setupStates.bind(provider);
        await expect(findStateHandler(unsuccessfulMessage)).resolves.toEqual(
          [],
        );
      });
    });
  });

  describe('#waitForServerReady', () => {
    describe('when the http server starts up', () => {
      it('returns a resolved promise', async () => {
        const server = http.createServer(() => {}).listen();

        await waitForServerReady(server);
        server.close();
      });
    });
  });

  describe('#setupProxyServer', () => {
    describe('when the http server starts up', () => {
      it('returns a resolved promise', () => {
        const app = express();

        expect(setupProxyServer(app)).toBeInstanceOf(http.Server);
      });
    });
  });

  describe('#setupProxyApplication', () => {
    it('returns a valid express app', () => {
      const setupProxyApplication =
        // biome-ignore lint/suspicious/noExplicitAny: accessing private method for test coverage
        (provider as any).setupProxyApplication.bind(provider);
      expect(setupProxyApplication().listen).toBeTypeOf('function');
    });
  });
});
