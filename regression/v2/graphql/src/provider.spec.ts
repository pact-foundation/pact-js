import type * as http from 'node:http';
import * as path from 'node:path';
import { type LogLevel, Verifier } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, it } from 'vitest';
import app from './provider';

const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

let server: http.Server;

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  beforeAll(
    async () =>
      new Promise<void>((resolve) => {
        server = app.listen(4001, () => resolve());
      }),
  );

  afterAll(
    async () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
      }),
  );

  it('validates the expectations of Matching Service', () => {
    const opts = {
      pactUrls: [
        path.resolve(
          __dirname,
          '..',
          'pacts',
          'GraphQLConsumer-GraphQLProvider.json',
        ),
      ],
      providerBaseUrl: 'http://localhost:4001/graphql',
      logLevel: LOG_LEVEL as LogLevel,
    };

    return new Verifier(opts).verifyProvider();
  });
});
