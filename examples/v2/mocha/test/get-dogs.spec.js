'use strict';

const expect = require('chai').expect;
const path = require('path');
const { PactV2: Pact } = require('@pact-foundation/pact');
const { getMeDogs, getMeDog } = require('../index');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

describe('The Dog API', () => {
  let url = 'http://127.0.0.1';
  const port = 8992;

  const provider = new Pact({
    port: port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
    consumer: 'MyConsumer',
    provider: 'MyProvider',
    logLevel: LOG_LEVEL,
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
  before(() => provider.setup());

  // Write Pact when all tests done
  after(() => provider.finalize());

  // verify with Pact, and reset expectations
  afterEach(() => provider.verify());

  describe('get /dogs', () => {
    before(() => {
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
      expect(response.data).to.eql(EXPECTED_BODY);
    });
  });
});
