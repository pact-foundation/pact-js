import path from 'node:path';
import {
  type LogLevel,
  Matchers,
  Pact,
  SpecificationVersion,
} from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';
import { UserServiceClient } from './consumer';

const { like, integer, eachLike } = Matchers;

/**
 * Consumer-side Pact tests for the User Service.
 *
 * Each test defines one interaction: the HTTP request this consumer sends
 * and the minimum response it requires. Pact writes these to a pact file
 * that the provider verifies separately (see provider.test.ts).
 *
 * Key principle: only assert what this consumer actually uses. Omit fields
 * the consumer ignores — the provider is then free to change or add them
 * without breaking this contract.
 */
describe('UserServiceClient', () => {
  const pact = new Pact({
    consumer: 'UserConsumer',
    provider: 'UserProvider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
  });

  it('fetches a user by ID', async () => {
    await pact
      .addInteraction()
      // Provider states name a precondition the provider must satisfy before
      // this interaction is verified. The provider maps this exact string to
      // setup code in its stateHandlers (see provider.test.ts).
      //
      // Note: hardcoding the ID 1 into this magic string is bad practice.
      // Provider states with configurable values are recommended, as
      // demonstrated in the provider-state example. It is used here for
      // simplicity.
      .given('a user with ID 1 exists')
      .uponReceiving('a GET request for user 1')
      .withRequest('GET', '/users/1', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        // like() matches the shape and types of its argument, not the exact
        // values. The values here are example data for the mock response.
        // The contract enforces: id is an integer, name and email are strings.
        // The provider may return { id: 42, name: 'Bob', email: 'b@example.com' }
        // and the contract will still pass.
        builder.jsonBody(
          like({
            id: integer(1),
            name: like('Alice'),
            email: like('alice@example.com'),
          }),
        );
      })
      .executeTest(async (mockserver) => {
        // A common pitfall here is to use a standard HTTP client to call the
        // mock server directly. This bypasses the client code that is meant
        // to be tested, and thus may not reflect the real consumer behaviour.
        const client = new UserServiceClient(mockserver.url);
        const user = await client.getUser(1);
        // These assertions run against the mock's example values.
        expect(user.id).toBe(1);
        expect(user.name).toBe('Alice');
        expect(user.email).toBe('alice@example.com');
      });
  });

  it('fetches all users', async () => {
    await pact
      .addInteraction()
      .given('users exist')
      .uponReceiving('a GET request for all users')
      .withRequest('GET', '/users', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        // eachLike() means: respond with an array where every element matches
        // this shape. The mock returns exactly one element; the contract
        // enforces that the array is non-empty and each element has this shape.
        builder.jsonBody(
          eachLike({
            id: integer(1),
            name: like('Alice'),
            email: like('alice@example.com'),
          }),
        );
      })
      .executeTest(async (mockserver) => {
        const client = new UserServiceClient(mockserver.url);
        const users = await client.getUsers();
        expect(users.length).toBeGreaterThan(0);
        expect(users[0].id).toBe(1);
      });
  });
});
