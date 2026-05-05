import type { Server } from 'node:http';
import path from 'node:path';
import { type LogLevel, Verifier } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { createApp } from './provider';

describe('UploadProvider', () => {
  let server: Server;

  beforeAll(() => {
    server = createApp().listen(3004);
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it(
    'satisfies all UploadConsumer expectations',
    () =>
      new Verifier({
        providerBaseUrl: 'http://localhost:3004',
        pactUrls: [
          path.resolve(
            process.cwd(),
            'pacts/UploadConsumer-UploadProvider.json',
          ),
        ],
        stateHandlers: {
          'the upload service is ready': async () => {
            /* stateless */
          },
        },
        logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
      }).verifyProvider(),
    30_000,
  );
});
