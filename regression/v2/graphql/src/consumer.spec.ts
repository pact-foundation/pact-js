/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */

import * as path from 'node:path';
import {
  GraphQLInteraction,
  type LogLevel,
  MatchersV2 as Matchers,
  PactV2 as Pact,
} from '@pact-foundation/pact';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { query } from './consumer';

const { like } = Matchers;
const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('GraphQL example', () => {
  const provider = new Pact({
    port: 4000,
    log: path.resolve(__dirname, '..', 'logs', 'mockserver-integration.log'),
    dir: path.resolve(__dirname, '..', 'pacts'),
    consumer: 'GraphQLConsumer',
    provider: 'GraphQLProvider',
    logLevel: LOG_LEVEL as LogLevel,
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  describe('query hello on /graphql', () => {
    beforeAll(() => {
      const graphqlQuery = new GraphQLInteraction()
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
      return provider.addInteraction(graphqlQuery);
    });

    it('returns the correct response', async () => {
      await expect(query()).resolves.toEqual({
        hello: 'Hello world!',
      });
    });

    // verify with Pact, and reset expectations
    afterEach(() => provider.verify());
  });
});
