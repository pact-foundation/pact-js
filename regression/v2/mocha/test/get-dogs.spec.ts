import path from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { type LogLevel, PactV2 as Pact } from '@pact-foundation/pact';
import { getMeDogs } from '../index';

const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('The Dog API', () => {
  const url = 'http://127.0.0.1';
  const port = 8992;

  const provider = new Pact({
    port: port,
    log: path.resolve(__dirname, '..', 'logs', 'mockserver-integration.log'),
    dir: path.resolve(__dirname, '..', 'pacts'),
    spec: 2,
    consumer: 'MyConsumer',
    provider: 'MyProvider',
    logLevel: LOG_LEVEL as LogLevel,
  });

  const EXPECTED_BODY = [
    {
      dog: 1,
    },
    {
      dog: 2,
    },
  ];

  // Setup the provider
  beforeAll(() => provider.setup());

  // Write Pact when all tests done
  afterAll(() => provider.finalize());

  // verify with Pact, and reset expectations
  afterEach(() => provider.verify());

  describe('get /dogs', () => {
    beforeAll(() => {
      const interaction = {
        state: 'i have a list of dogs',
        uponReceiving: 'a request for all dogs',
        withRequest: {
          method: 'GET',
          path: '/dogs',
          headers: {
            // Accept: 'application/problem+json, application/json, text/plain, */*', // <- fails, must use array syntax ❌
            Accept: [
              'application/problem+json',
              'application/json',
              'text/plain',
              '*/*',
            ],
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: EXPECTED_BODY,
        },
      };
      return provider.addInteraction(interaction);
    });

    it('returns the correct response', async () => {
      const urlAndPort = {
        url: url,
        port: port,
      };
      const response = await getMeDogs(urlAndPort);
      expect(response.data).toEqual(EXPECTED_BODY);
    });
  });
});
