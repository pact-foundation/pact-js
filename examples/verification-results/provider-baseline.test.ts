import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { type LogLevel, Verifier } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createApp,
  makeResourceThreeAvailable,
  resetProviderState,
} from './provider';

const pactDir = path.resolve(process.cwd(), 'pacts');

/**
 * Baseline provider verification: one `verifyProvider()` call covers every
 * pact file. This is how pact-js works today, before the per-interaction
 * reporting extension. Both pacts and all five interactions end up in a
 * single test case from the test framework's point of view.
 *
 * Run `npm run test:consumer` first to generate the pact files.
 */
describe('DemoProvider', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = createApp().listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it('satisfies DemoConsumer and OtherConsumer expectations', async () => {
    const output = await new Verifier({
      provider: 'DemoProvider',
      providerBaseUrl: baseUrl,
      pactUrls: [
        path.join(pactDir, 'DemoConsumer-DemoProvider.json'),
        path.join(pactDir, 'OtherConsumer-DemoProvider.json'),
      ],
      stateHandlers: {
        'resource three is available': async () => {
          makeResourceThreeAvailable();
        },
      },
      afterEach: async () => {
        resetProviderState();
      },
      logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
    }).verifyProvider();

    // pact-core >= 19 resolves with the verifier's JSON document.
    const result = JSON.parse(output);
    expect(result.result).toBe(true);
    expect(result.interactionResults).toHaveLength(5);
  }, 30_000);
});
