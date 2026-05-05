# HTTP Example

This example demonstrates the core Pact workflow for HTTP consumer/provider contract testing. It is the recommended starting point for anyone new to Pact.

A `UserServiceClient` (consumer) fetches user profiles from a `UserService` (provider). The consumer and provider are tested independently — neither needs the other to be running.

## What You'll Learn

- How to define a Pact interaction with `.addInteraction()`
- The role of provider states (`given()`) and how they map to `stateHandlers`
- Why `like()`, `integer()`, and `eachLike()` are preferred over exact values
- How the pact file connects the consumer and provider tests

## Running the Example

```bash
npm install
npm test
```

`npm test` runs the consumer test first (generating the pact file), then the provider test (verifying the pact file). You can also run them separately:

```bash
npm run test:consumer   # generates pacts/UserConsumer-UserProvider.json
npm run test:provider   # verifies the pact file against the real provider
```

## How It Works

### Consumer (`consumer.ts`, `consumer.test.ts`)

`UserServiceClient` makes HTTP requests to the User Service. The consumer test uses `pact.addInteraction()` to define what the client sends and what it minimally expects back. Matchers like `like()` and `integer()` express structural constraints rather than exact values. The contract says "give me an object with an integer `id` and a string `name`", not "give me `{ id: 1, name: 'Alice' }`". This gives the provider freedom to evolve without breaking the contract.

`executeTest()` starts a mock server, runs your assertion code against it, and automatically writes the interaction to the pact file on success.

### Provider (`provider.ts`, `provider.test.ts`)

The provider is a simple Express server with a `GET /users/:id` route. The provider test uses `Verifier` to replay each interaction from the pact file against this real server. Before each interaction is replayed, Pact calls the matching `stateHandler` to seed the precondition (e.g. "a user with ID 1 exists" → insert user 1 into the in-memory store).

The provider only needs to satisfy what the consumer asked for. It is free to return additional fields (`address`, `phone`, etc.) without breaking the contract.

## v2/v3 migration note

In Pact v2/v3 the DSL used `new PactV3({ ... })`.
In v4, the same `Pact` class handles all spec versions via `SpecificationVersion`.
The builder pattern for interactions (`.withRequest(..., builder => ...)`)
replaced the older object-literal style.

## Further Reading

- [Pact consumer tests](https://docs.pact.io/implementation_guides/javascript/docs/consumer)
- [Pact provider verification](https://docs.pact.io/implementation_guides/javascript/docs/provider)
- [Matchers](https://docs.pact.io/implementation_guides/javascript/docs/matching)
- [Provider states](https://docs.pact.io/implementation_guides/javascript/docs/provider#provider-states)
