import type { Server } from 'node:http';
import path from 'node:path';
import { type LogLevel, Verifier } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { createApp, seedBooks } from './provider';

describe('CatalogueService', () => {
  let server: Server;

  beforeAll(() => {
    server = createApp().listen(3007);
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it(
    'satisfies all CatalogueConsumer expectations',
    () =>
      new Verifier({
        providerBaseUrl: 'http://localhost:3007',
        pactUrls: [
          path.resolve(
            process.cwd(),
            'pacts/CatalogueConsumer-CatalogueService.json',
          ),
        ],
        stateHandlers: {
          'the catalogue has books': async () => {
            seedBooks([
              { id: 101, title: 'Clean Code', author: 'Robert Martin' },
              { id: 102, title: 'Refactoring', author: 'Martin Fowler' },
            ]);
          },
        },
        logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
      }).verifyProvider(),
    30_000,
  );
});
