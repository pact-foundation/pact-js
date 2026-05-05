# Provider States

## The problem they solve

Consumer tests describe HTTP interactions: "when the consumer sends this request, the provider responds with this." But a provider's response usually depends on data — a user in the database, an account in a particular status, an empty cart.

Without a way to set up that data, provider verification becomes: "what does my provider return right now?" That is a snapshot test against whatever happens to be in the database, not a contract test.

Provider states give the consumer a way to declare a precondition — "given X is true" — and give the provider a way to satisfy it before the interaction is replayed.

## The lifecycle

1. **Consumer declares a state.** In the consumer test, `.given('a user with ID 1 exists')` names the precondition. This string is recorded verbatim in the pact file.
2. **Provider registers a handler.** In the provider verification test, `stateHandlers` maps that exact string to a function that sets up the precondition — inserting a database row, seeding an in-memory store, setting a flag.
3. **Verifier calls the handler.** Before replaying each interaction, `Verifier` calls the matching state handler. The provider is now in the right state for the request to succeed.
4. **Interaction is replayed.** The recorded request is sent to the running provider and the response is compared against the contract.

```typescript
new Verifier({
  providerBaseUrl: 'http://localhost:3001',
  pactUrls: ['./pacts/UserConsumer-UserProvider.json'],
  stateHandlers: {
    'a user with ID 1 exists': async () => {
      clearUsers();
      seedUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
    },
    'users exist': async () => {
      clearUsers();
      seedUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
      seedUser({ id: 2, name: 'Bob', email: 'bob@example.com' });
    },
  },
}).verifyProvider();
```

## Why naming matters

Provider state names are part of the contract — the consumer writes them, the provider must implement them. A vague name like `"user exists"` is ambiguous. A precise name like `"a user with ID 1 exists"` leaves no doubt and enables **selective verification** via environment variables:

- `PACT_DESCRIPTION` — only verify interactions whose description matches
- `PACT_PROVIDER_STATE` — only verify interactions with this provider state
- `PACT_PROVIDER_NO_STATE` — only verify interactions that have no provider state

See `examples/provider-state/` for a working example that also demonstrates parameterised states — where the state name contains a placeholder like `{accountNumber}` that the verifier substitutes at runtime.

## The no-state interaction

Not every interaction depends on data. A health check, a 404 for a resource that does not exist, or a static configuration endpoint are the same regardless of database state. These interactions simply omit `.given(...)` in the consumer test. The verifier runs them without calling any state handler.

```typescript
// No .given() call — this interaction has no provider state
await pact
  .addInteraction()
  .uponReceiving('a GET request for a non-existent user')
  .withRequest('GET', '/users/99999')
  .willRespondWith(404)
  .executeTest(async (mockserver) => { /* ... */ });
```

When you see `PACT_PROVIDER_NO_STATE` in CI, it is selecting exactly these stateless interactions.
