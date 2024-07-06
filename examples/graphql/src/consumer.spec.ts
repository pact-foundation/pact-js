/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
import * as chai from 'chai';
import * as path from 'path';
import * as chaiAsPromised from 'chai-as-promised';
import { query } from './consumer';
import { Matchers, LogLevel, GraphQLPactV3 } from '@pact-foundation/pact';
const { like } = Matchers;
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

const expect = chai.expect;

chai.use(chaiAsPromised);

describe('GraphQL example', () => {
  const provider = new GraphQLPactV3({
    port: 4000,
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'GraphQLConsumer',
    provider: 'GraphQLProvider',
    logLevel: LOG_LEVEL as LogLevel,
  });

  describe('When the "hello" query on /graphql is made', () => {
    before(() => {
      provider
        .given('the world exists')
        .uponReceiving('a hello request')
        .withQuery(
          `
          query HelloQuery {
            hello
          }
        `
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
        return expect(query()).to.eventually.deep.equal({
          hello: 'Hello world!',
        });
      });
    });
  });
});
