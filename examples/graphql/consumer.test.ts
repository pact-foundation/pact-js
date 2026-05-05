import path from 'node:path';
import {
  type LogLevel,
  Matchers,
  Pact,
  SpecificationVersion,
} from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';
import { fetchHello } from './consumer';

const { like } = Matchers;

/**
 * Consumer Pact tests for the GraphQL Hello service.
 *
 * Pact treats GraphQL as a specialised form of HTTP: the interaction is still
 * a POST request, but `addGraphQLInteraction()` parses the query body and
 * normalises whitespace and field ordering when matching. You define the exact
 * GraphQL operation, variables, and expected response shape.
 *
 * Important: Pact verifies the GraphQL *contract* (request shape + response
 * shape), not the query logic. Use your GraphQL server's own tests for logic.
 */
describe('fetchHello — GraphQL consumer', () => {
  const pact = new Pact({
    consumer: 'GraphQLConsumer',
    provider: 'GraphQLProvider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
  });

  it('sends a HelloQuery and receives a greeting', async () => {
    await pact
      .addGraphQLInteraction()
      .given('the hello service is available')
      .uponReceiving('a HelloQuery request')
      // addGraphQLInteraction() wraps the operation details and generates
      // the correct POST body matcher automatically.
      .withOperation('HelloQuery')
      .withVariables({ name: 'World' })
      .withRequest('POST', '/graphql')
      .withQuery(`
        query HelloQuery {
          hello
        }
      `)
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json; charset=utf-8' });
        // like() on the greeting string: the provider may return any greeting,
        // not specifically "Hello, World!". The contract only requires it to be
        // a string at data.hello.
        builder.jsonBody({ data: { hello: like('Hello, World!') } });
      })
      .executeTest(async (mockserver) => {
        const greeting = await fetchHello(mockserver.url);
        expect(greeting).toBe('Hello, World!');
      });
  });
});
