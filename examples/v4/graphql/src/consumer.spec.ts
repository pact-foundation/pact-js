/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
import * as chai from 'chai';
import * as path from 'path';
import * as chaiAsPromised from 'chai-as-promised';
import { query } from './consumer';
import { Matchers, LogLevel, Pact } from '@pact-foundation/pact';
import { V4InteractionWithResponse } from '@pact-foundation/pact/src/v4/http/types';
const { like } = Matchers;
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

const expect = chai.expect;

chai.use(chaiAsPromised);

describe('GraphQL example', () => {
  const provider = new Pact({
    port: 4000,
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'GraphQLConsumerV4',
    provider: 'GraphQLProviderV4',
    logLevel: LOG_LEVEL as LogLevel,
  });

  describe('When the "hello" query on /graphql is made', () => {
    let prepared: V4InteractionWithResponse;

    before(() => {
      prepared = provider
        .addGraphQLInteraction()
        .given('the world exists')
        .uponReceiving('a hello request')
        .withOperation('HelloQuery')
        .withVariables({
          foo: 'bar',
        })
        .withRequest('POST', '/graphql')
        .withQuery(
          `
          query HelloQuery {
            hello
          }
        `
        )
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type': 'application/json; charset=utf-8',
          });
          builder.jsonBody({
            data: {
              hello: like('Hello world!'),
            },
          });
        });
    });

    it('returns the correct response', async () => {
      await prepared.executeTest(async () => {
        return expect(query()).to.eventually.deep.equal({
          hello: 'Hello world!',
        });
      });
    });
  });
});
