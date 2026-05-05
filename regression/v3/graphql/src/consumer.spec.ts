/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */

import * as path from 'node:path';
import { GraphQLPactV3, type LogLevel, Matchers } from '@pact-foundation/pact';
import { beforeAll, describe, expect, it } from 'vitest';
import { query } from './consumer';

const { like } = Matchers;
const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('GraphQL example', () => {
  const provider = new GraphQLPactV3({
    port: 4001,
    dir: path.resolve(__dirname, '..', 'pacts'),
    consumer: 'GraphQLConsumer',
    provider: 'GraphQLProvider',
    logLevel: LOG_LEVEL as LogLevel,
  });

  describe('When the "hello" query on /graphql is made', () => {
    beforeAll(() => {
      provider
        .given('the world exists')
        .uponReceiving('a hello request')
        .withQuery(
          `
          query HelloQuery {
            hello
          }
        `,
        )
        .withOperation('HelloQuery')
        .withRequest({
          path: '/graphql',
          method: 'POST',
        })
        .withVariables({
          foo: 'bar',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            data: {
              hello: like('Hello world!'),
            },
          },
        });
    });

    it('returns the correct response', async () => {
      await provider.executeTest(async () => {
        await expect(query()).resolves.toEqual({
          hello: 'Hello world!',
        });
      });
    });
  });
});
