import type { Server } from 'node:http';
import path from 'node:path';
import { type LogLevel, Verifier } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { createApp } from './provider';

/**
 * Provider verification for the MATT protocol example.
 *
 * MATT is a fictional wire format used here purely for demonstration — it
 * wraps a string payload with the literal "MATT" on each side (so "hello"
 * becomes "MATThelloMATT"). It is not a real protocol.
 *
 * The Verifier works the same as for HTTP — it replays each interaction from
 * the pact file. The matt plugin handles encoding/decoding the MATT bodies
 * transparently; the Verifier just sees HTTP requests and responses.
 */
describe('MattProvider', () => {
  let server: Server;

  beforeAll(() => {
    server = createApp().listen(3005);
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it(
    'satisfies all MattConsumer expectations',
    () =>
      new Verifier({
        providerBaseUrl: 'http://localhost:3005',
        pactUrls: [
          path.resolve(process.cwd(), 'pacts/MattConsumer-MattProvider.json'),
        ],
        stateHandlers: {
          'the MATT service is running': async () => {
            /* stateless */
          },
        },
        logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
      }).verifyProvider(),
    30_000,
  );
});
