import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { defineVerificationSuite, type LogLevel } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createApp,
  makeResourceThreeAvailable,
  resetProviderState,
} from './provider';

/**
 * Provider verification reported per pact and per interaction.
 *
 * `defineVerificationSuite` reads the pact files and registers one `describe`
 * per pact (consumer -> provider) and one `it` per interaction. The
 * verification itself runs once, when the first test case executes; every
 * test case then reports the outcome of its own interaction, including the
 * mismatches when it failed.
 *
 * Run `npm run test:consumer` first to generate the pact files.
 */
describe('DemoProvider', () => {
  let server: Server;
  // The provider is started in beforeAll, i.e. after the suite has been
  // defined, so the base URL is resolved lazily.
  let baseUrl = '';

  beforeAll(async () => {
    server = createApp({ failing: process.env.FAILING === '1' }).listen(
      0,
      '127.0.0.1',
    );
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  defineVerificationSuite(
    {
      provider: 'DemoProvider',
      get providerBaseUrl() {
        return baseUrl;
      },
      pactUrls: [path.resolve(process.cwd(), 'pacts')],
      stateHandlers: {
        'resource three is available': async () => {
          makeResourceThreeAvailable();
        },
      },
      afterEach: async () => {
        resetProviderState();
      },
      logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
    },
    { describe, it },
  );
});
