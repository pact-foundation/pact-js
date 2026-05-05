import type { Server } from 'node:http';
import path from 'node:path';
import { type LogLevel, Verifier } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { createApp } from './provider';

/**
 * Provider verification for the matchers example.
 *
 * The provider intentionally returns DIFFERENT values than the consumer's
 * examples: products with different IDs, names, and prices. Every verification
 * still passes because the contract uses matchers (not exact values). This is
 * the central demonstration of the matchers example.
 */
describe('MatchersProvider', () => {
  let server: Server;

  beforeAll(() => {
    server = createApp().listen(3002);
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it(
    'satisfies all MatchersConsumer expectations',
    () =>
      new Verifier({
        providerBaseUrl: 'http://localhost:3002',
        pactUrls: [
          path.resolve(
            process.cwd(),
            'pacts/MatchersConsumer-MatchersProvider.json',
          ),
        ],
        stateHandlers: {
          'a product exists': async () => {
            /* provider already has static data */
          },
          'products exist': async () => {
            /* provider always returns data */
          },
          'the catalog is populated': async () => {
            /* provider has static catalog */
          },
        },
        logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
      }).verifyProvider(),
    30_000,
  );
});
