'use strict';

const expect = require('chai').expect;
const path = require('path');
const { PactV3, Matchers } = require('@pact-foundation/pact');
const { getMeDogs, getMeDog } = require('../index');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

describe('The Dog API', () => {
  const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'MyConsumer',
    provider: 'MyProvider',
    logLevel: LOG_LEVEL,
    host: '127.0.0.1',
  });

  const EXPECTED_BODY = [
    {
      dog: 1,
    },
    {
      dog: 2,
    },
  ];

  describe('get /dogs', () => {
    before(() => {
      const responseHeaders = {
        'Content-Type': Matchers.regex({
          generate:
            'application/x.avidxchange.accounting+json;charset=utf-8;version=1.0.0',
          matcher:
            'application\\/x\\.avidxchange\\.accounting\\+json;charset=utf-8;version=([0-9]\\.?){3}',
        }),
      };
      const interaction = {
        state: 'i have a list of dogs',
        uponReceiving: 'a request for all dogs',
        withRequest: {
          method: 'POST',
          path: '/dogs',
          headers: {
            'Content-Type':
              'application/x.avidxchange.accounting+json;version=1.0.0',
            Accept: 'application/x.avidxchange.accounting+json;version=1.0.0',
          },
          body: {
            foo: 'bar',
          },
        },
        willRespondWith: {
          status: 200,
          headers: responseHeaders,
          body: EXPECTED_BODY,
        },
      };
      return provider.addInteraction(interaction);
    });

    it('returns the correct response', async () => {
      return provider.executeTest(async (mockserver) => {
        const urlAndPort = {
          url: 'http://127.0.0.1',
          port: mockserver.port,
        };
        const response = await getMeDogs(urlAndPort);
        expect(response.data).to.eql(EXPECTED_BODY);
      });
    });
  });
});
