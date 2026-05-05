import type { Server } from 'node:http';
import path from 'node:path';
import { type LogLevel, Verifier } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { clearUsers, createApp, seedUser } from './provider';

/**
 * Provider-side Pact verification for the User Service.
 *
 * This test replays every interaction from the consumer's pact file against
 * the real provider, proving it behaves exactly as the consumer expects.
 *
 * State handlers are the bridge between Pact's abstract provider state strings
 * (e.g. "a user with ID 1 exists") and the actual setup work needed to satisfy
 * them. Each handler runs before the corresponding interaction is replayed.
 *
 * Run `npm run test:consumer` first to generate the pact file.
 */
describe('UserProvider', () => {
  let server: Server;

  beforeAll(() => {
    server = createApp().listen(3001);
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it(
    'satisfies all UserConsumer expectations',
    () =>
      new Verifier({
        providerBaseUrl: 'http://localhost:3001',
        pactUrls: [
          path.resolve(process.cwd(), 'pacts/UserConsumer-UserProvider.json'),
        ],
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
        logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
      }).verifyProvider(),
    30_000,
  );
});
