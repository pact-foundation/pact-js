# Your First Contract Test with pact-js

In this tutorial we will write a consumer-driven contract test from scratch. By the end, we will have a `UserClient` (consumer) that fetches a user from a `UserService` (provider), a pact file that records the contract between them, and a passing provider verification. The consumer and provider never run at the same time — that is the point.

## Prerequisites

- Node.js >=20
- Basic TypeScript/JavaScript knowledge
- No prior Pact knowledge required

## What we're building

We have two services. `UserClient` is a simple HTTP client — it could be a frontend or another microservice. `UserService` is the backend that returns user profiles. We will write a contract that says: "I need `GET /users/1` to return at least `{ id, name, email }`." Then we will prove the backend honours it.

## Step 1: Set up the project

Create a new directory and initialise a project:

```bash
mkdir pact-tutorial && cd pact-tutorial
npm init -y
npm install --save-dev @pact-foundation/pact vitest tsx
npm install axios express
```

Add a `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test:consumer": "vitest run consumer.test.ts",
    "test:provider": "vitest run provider.test.ts",
    "test": "npm run test:consumer && npm run test:provider"
  }
}
```

## Step 2: Write the consumer client

Create `consumer.ts`. This is the code that will actually run in production — our HTTP client for the user service.

```typescript
import axios from 'axios';

export interface User {
  id: number;
  name: string;
  email: string;
}

export class UserClient {
  constructor(private readonly baseUrl: string) {}

  async getUser(id: number): Promise<User> {
    const { data } = await axios.get<User>(`${this.baseUrl}/users/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return data;
  }
}
```

Notice the constructor takes a `baseUrl`. In production that will be the real service URL. In our Pact test it will be the mock server's URL — the client never needs to know the difference.

## Step 3: Write the consumer contract test

Create `consumer.test.ts`. We will walk through each part.

```typescript
import { describe, it, expect } from 'vitest';
import { Pact, SpecificationVersion, Matchers } from '@pact-foundation/pact';
import path from 'node:path';
import { UserClient } from './consumer';

const { like, integer } = Matchers;

describe('UserClient', () => {
  // The Pact object owns the mock server and the pact file.
  // consumer and provider are names — they become the filename:
  // pacts/UserClient-UserService.json
  const pact = new Pact({
    consumer: 'UserClient',
    provider: 'UserService',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

  it('fetches a user by ID', async () => {
    await pact
      .addInteraction()
      // given() names a precondition the provider must satisfy before
      // this interaction is verified. We will implement this on the
      // provider side in Step 6.
      .given('a user with ID 1 exists')
      // uponReceiving() is a human-readable description. Together with
      // given(), it must be unique within the pact file.
      .uponReceiving('a GET request for user 1')
      .withRequest('GET', '/users/1', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        // like() says: match the shape and types, not the exact values.
        // The values here are examples for the mock response.
        // integer(1) means: the id must be an integer; 1 is the example.
        // like('Alice') means: name must be a string; 'Alice' is the example.
        builder.jsonBody(
          like({
            id: integer(1),
            name: like('Alice'),
            email: like('alice@example.com'),
          }),
        );
      })
      // executeTest() starts the mock server, runs your function against it,
      // and — if the test passes — writes the interaction to the pact file.
      .executeTest(async (mockserver) => {
        const client = new UserClient(mockserver.url);
        const user = await client.getUser(1);
        expect(user.id).toBe(1);
        expect(user.name).toBe('Alice');
        expect(user.email).toBe('alice@example.com');
      });
  });
});
```

Two things are worth pausing on:

**`like()` on `name` and `email`**: we use `like` because the consumer only cares that these are strings. The specific value the real provider returns is irrelevant. If we used an exact value and the provider returned a different name, the contract would fail even though the provider is behaving correctly.

**`integer(1)` on `id`**: we use `integer` because the consumer needs to know the ID is a whole number (it may use it as a route parameter). The `1` is the example value the mock returns; the contract says "any integer".

## Step 4: Run the consumer test and read the pact file

```bash
npm run test:consumer
```

If the test passes, `pacts/UserClient-UserService.json` now exists. Open it. You will see something like:

```json
{
  "consumer": { "name": "UserClient" },
  "provider": { "name": "UserService" },
  "interactions": [
    {
      "description": "a GET request for user 1",
      "providerStates": [{ "name": "a user with ID 1 exists" }],
      "request": {
        "method": "GET",
        "path": "/users/1"
      },
      "response": {
        "status": 200,
        "matchingRules": { ... },
        "body": { "id": 1, "name": "Alice", "email": "alice@example.com" }
      }
    }
  ]
}
```

The `matchingRules` section is where Pact records the type constraints from your matchers. This file is the contract — everything the provider needs to know is in here.

## Step 5: Write the provider

Create `provider.ts`. This is a minimal Express server — the real implementation we will verify against.

```typescript
import express, { type Express } from 'express';

type User = { id: number; name: string; email: string };

const users = new Map<number, User>();

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/users/:id', (req, res) => {
    const user = users.get(Number(req.params.id));
    user ? res.json(user) : res.status(404).json({ error: 'Not found' });
  });

  return app;
}

export function seedUser(user: User): void {
  users.set(user.id, user);
}

export function clearUsers(): void {
  users.clear();
}
```

The `seedUser` and `clearUsers` functions are there so our provider test can set up exactly the data each interaction needs.

## Step 6: Write the provider verification test

Create `provider.test.ts`.

```typescript
import { beforeAll, afterAll, describe, it } from 'vitest';
import { Verifier } from '@pact-foundation/pact';
import type { Server } from 'node:http';
import path from 'node:path';
import { createApp, seedUser, clearUsers } from './provider';

describe('UserService', () => {
  let server: Server;

  beforeAll(() => {
    // Start the real provider on a known port.
    server = createApp().listen(3001);
  });

  afterAll(
    () => new Promise<void>((resolve) => server.close(() => resolve())),
  );

  it('satisfies all UserClient expectations', () =>
    new Verifier({
      // The running provider.
      providerBaseUrl: 'http://localhost:3001',
      // The pact file generated by the consumer test.
      pactUrls: [path.resolve(process.cwd(), 'pacts/UserClient-UserService.json')],
      // State handlers: Pact calls these before replaying each interaction.
      // The key must match the string passed to .given() in the consumer test.
      stateHandlers: {
        'a user with ID 1 exists': async () => {
          clearUsers();
          seedUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
        },
      },
      logLevel: 'warn',
    }).verifyProvider(),
    30_000,
  );
});
```

`Verifier` reads the pact file and replays every interaction. Before replaying "a GET request for user 1", it calls the `'a user with ID 1 exists'` state handler, which inserts the user into the in-memory store. Then it sends the recorded request to our Express server and checks the response.

The provider does not call the consumer. It does not import any consumer code. It only knows about the pact file.

## Step 7: Run the provider verification

```bash
npm run test:provider
```

You should see output like:

```
Verifying a pact between UserClient and UserService

  a GET request for user 1
    Given a user with ID 1 exists
      with GET /users/1
        returns a response which
          has status code 200 ✓
          has a matching body ✓

1 interaction, 0 failures
```

All interactions verified. The provider satisfies the consumer's contract.

## What you've built

You defined a contract from the consumer's perspective, generated a pact file that records it, and proved the provider honours it — without the consumer and provider ever running together. Neither team needs to wait for the other. If the provider changes in a way that breaks this contract, the verification step will catch it immediately.

## Next steps

- Try the full worked example with more interactions: `examples/http/`
- Explore the full matcher library: `examples/matchers/`
- Understand matchers and provider states in depth: `docs/concepts/`
- Share pacts across teams with a Pact Broker: [docs.pact.io/pact_broker](https://docs.pact.io/pact_broker)
