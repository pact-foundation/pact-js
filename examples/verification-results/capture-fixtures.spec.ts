import { mkdirSync, writeFileSync } from 'node:fs';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { type LogLevel, Verifier } from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';
import {
  createApp,
  makeResourceThreeAvailable,
  resetProviderState,
} from './provider';

/**
 * Captures the raw verifier JSON for a passing and a failing run.
 *
 * Not part of `npm test`. Run with `npm run capture:fixtures`. The output
 * lands in ./fixtures and is the basis for the result parser tests in
 * pact-js (Phase 0 of the per-interaction reporting extension).
 */
const pactDir = path.resolve(process.cwd(), 'pacts');
const fixtureDir =
  process.env.FIXTURE_DIR ?? path.resolve(process.cwd(), 'fixtures');
const pactUrls = [
  path.join(pactDir, 'DemoConsumer-DemoProvider.json'),
  path.join(pactDir, 'OtherConsumer-DemoProvider.json'),
];

async function startProvider(
  failing: boolean,
): Promise<{ server: Server; baseUrl: string }> {
  const server = createApp({ failing }).listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

function stopProvider(server: Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

/**
 * Runs the verifier and returns the raw string pact-js hands back, together
 * with the channel it arrived on. On success `verifyProvider()` resolves
 * with the JSON; on failure it rejects with an Error whose message is the JSON.
 */
async function runVerifier(
  baseUrl: string,
): Promise<{ channel: 'resolved' | 'rejected'; raw: string }> {
  const verifier = new Verifier({
    provider: 'DemoProvider',
    providerBaseUrl: baseUrl,
    pactUrls,
    stateHandlers: {
      'resource three is available': async () => {
        makeResourceThreeAvailable();
      },
    },
    afterEach: async () => {
      resetProviderState();
    },
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
  });
  try {
    return { channel: 'resolved', raw: await verifier.verifyProvider() };
  } catch (e) {
    return { channel: 'rejected', raw: (e as Error).message };
  }
}

function writeFixture(name: string, raw: string): unknown {
  mkdirSync(fixtureDir, { recursive: true });
  const parsed = JSON.parse(raw);
  writeFileSync(
    path.join(fixtureDir, `${name}.json`),
    `${JSON.stringify(parsed, null, 2)}\n`,
  );
  return parsed;
}

describe('capture verifier JSON fixtures', () => {
  it('captures a passing run', async () => {
    const { server, baseUrl } = await startProvider(false);
    try {
      const { channel, raw } = await runVerifier(baseUrl);
      expect(channel).toBe('resolved');
      const parsed = writeFixture('verification-success', raw) as {
        result: boolean;
      };
      expect(parsed.result).toBe(true);
    } finally {
      await stopProvider(server);
    }
  }, 30_000);

  it('captures a failing run', async () => {
    const { server, baseUrl } = await startProvider(true);
    try {
      const { channel, raw } = await runVerifier(baseUrl);
      expect(channel).toBe('rejected');
      const parsed = writeFixture('verification-failure', raw) as {
        result: boolean;
      };
      expect(parsed.result).toBe(false);
    } finally {
      await stopProvider(server);
    }
  }, 30_000);
});
