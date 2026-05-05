import type { Server } from 'node:http';
import path from 'node:path';
import { type LogLevel, Verifier } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { createApp } from './provider';

/**
 * Provider verification for the GraphQL Hello service.
 *
 * Pact replays the GraphQL request (as a POST /graphql) against the real
 * provider and checks that the response matches the contract. No special
 * GraphQL-aware tooling is needed on the provider side.
 */
describe('GraphQLProvider', () => {
  let server: Server;

  beforeAll(() => {
    server = createApp().listen(3003);
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it(
    'satisfies all GraphQLConsumer expectations',
    () =>
      new Verifier({
        providerBaseUrl: 'http://localhost:3003',
        pactUrls: [
          path.resolve(
            process.cwd(),
            'pacts/GraphQLConsumer-GraphQLProvider.json',
          ),
        ],
        stateHandlers: {
          'the hello service is available': async () => {
            /* always available */
          },
        },
        logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
      }).verifyProvider(),
    30_000,
  );
});
