# GraphQL Example

This example shows how to use Pact for GraphQL APIs. Pact treats GraphQL as a specialised form of HTTP. The contract captures the exact operation, variables, and response shape expected by the consumer.

## What You'll Learn

- Using `addGraphQLInteraction()` to define a GraphQL contract
- How Pact normalises query whitespace so minor formatting changes don't break contracts
- Provider verification works the same as HTTP — no special GraphQL tools needed

## Running the Example

```bash
npm install
npm test
```

## How It Works

**Consumer** sends a `HelloQuery` operation as a POST to `/graphql`. Pact's `addGraphQLInteraction()` parses the query, records the operation name and variables, and normalises whitespace before matching. This means you can reformat your query string without breaking the contract.

**Provider** implements the GraphQL schema using the `graphql` package and handles requests at `POST /graphql`. The Verifier replays the consumer's POST request and checks that the response matches.

Pact verifies the *contract* between consumer and provider: whether the provider returns the right shape. Testing GraphQL query logic (resolvers, filters, pagination) belongs in the provider's own test suite.

## Further Reading

- [Pact GraphQL support](https://docs.pact.io/implementation_guides/javascript/docs/graphql)
