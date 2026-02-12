## GraphQL API

GraphQL is simply an abstraction over HTTP and may be tested via Pact.

## Support

|   Role   | Interface  | Supported? |
| :------: | :--------: | :--------: |
| Consumer |   `Pact`   |     ✅      |
| Consumer |  `PactV3`  |     ✅      |
| Consumer |  `PactV2`  |     ✅      |
| Provider | `Verifier` |     ✅      |

### API

The `Pact` class provides `addGraphQLInteraction()` which returns a fluent builder specifically designed for GraphQL. It handles the query/mutation body structure, operation naming, and variables automatically, so you do not need to manually construct the JSON payload.

For `PactV3` and `PactV2`, there are two wrapper APIs available: `GraphQLInteraction` and `ApolloGraphQLInteraction` that can be used as a drop-in replacement for the `addInteraction` method. These are lightweight wrappers over the standard DSL to make GraphQL testing a bit nicer.

## Using the V4 GraphQL Interface (Recommended)

The `addGraphQLInteraction()` method provides a purpose-built builder for GraphQL queries and mutations.

### Consumer Test

```js
import { Pact, Matchers, LogLevel } from '@pact-foundation/pact';

const { like } = Matchers;

const provider = new Pact({
  consumer: 'GraphQLConsumer',
  provider: 'GraphQLProvider',
  logLevel: 'info' as LogLevel,
});

describe('GraphQL consumer test', () => {
  it('queries for hello', async () => {
    const prepared = provider
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

    await prepared.executeTest(async () => {
      // Call your GraphQL client pointing at the mock server
      const result = await myGraphQLClient.query({ query: HELLO_QUERY });
      expect(result.data.hello).to.equal('Hello world!');
    });
  });
});
```

The builder provides:

- `withOperation(name)` — sets the GraphQL operation name
- `withVariables(vars)` — sets the query variables
- `withQuery(query)` — sets a GraphQL query (accepts a string or a `graphql` AST node)
- `withMutation(mutation)` — sets a GraphQL mutation (accepts a string or a `graphql` AST node)

Use `withQuery` for read operations and `withMutation` for write operations. Each returns the standard HTTP interaction builder, so you chain `willRespondWith` and `executeTest` as normal.

### Provider Verification

Provider verification for GraphQL is identical to standard HTTP verification. Point the `Verifier` at your running GraphQL server:

```js
import { Verifier, LogLevel } from '@pact-foundation/pact';

const opts = {
  pactUrls: ['./pacts/GraphQLConsumer-GraphQLProvider.json'],
  providerBaseUrl: 'http://localhost:4000/graphql',
  logLevel: 'info' as LogLevel,
};

new Verifier(opts).verifyProvider().then(() => {
  console.log('Pact Verification Complete!');
});
```

No special configuration is required on the provider side — GraphQL interactions are just HTTP POST requests.

## Working Examples

See the [v4 GraphQL example](https://github.com/pact-foundation/pact-js/tree/master/examples/v4/graphql/) for a complete runnable project, including both consumer and provider tests.

For `PactV3` examples, see the [v3 GraphQL example](https://github.com/pact-foundation/pact-js/tree/master/examples/v3/graphql/).