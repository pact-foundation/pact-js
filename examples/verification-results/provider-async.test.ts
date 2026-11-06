import type { AddressInfo } from 'node:net';
import path from 'node:path';
import {
  defineVerificationSuiteAsync,
  type LogLevel,
} from '@pact-foundation/pact';
import { afterAll, describe, it } from 'vitest';
import {
  createApp,
  makeResourceThreeAvailable,
  resetProviderState,
} from './provider';

/**
 * Provider verification reported per pact and per interaction, with the test
 * cases taken from the verification result instead of from pact files.
 *
 * This is the variant to use with a Pact Broker: swap `pactUrls` for the usual
 * broker options and the pacts the broker returns become the test cases. The
 * verification runs as a normal broker verification, so the broker links stay
 * intact and `publishVerificationResult` keeps working:
 *
 * ```ts
 * await defineVerificationSuiteAsync(
 *   {
 *     provider: 'DemoProvider',
 *     providerBaseUrl: baseUrl,
 *     pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
 *     consumerVersionSelectors: [{ mainBranch: true }],
 *     publishVerificationResult: true,
 *     providerVersion: process.env.GIT_COMMIT,
 *   },
 *   { describe, it },
 * );
 * ```
 *
 * The verification has to finish before the test cases can be registered, so
 * the provider is started here at the top level rather than in `beforeAll`,
 * and the call is awaited at the top level of the file (Vitest and Mocha
 * support that; for Jest, see the provider docs).
 */
const server = createApp({ failing: process.env.FAILING === '1' }).listen(
  0,
  '127.0.0.1',
);
await new Promise<void>((resolve) => server.once('listening', resolve));
const { port } = server.address() as AddressInfo;

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

await defineVerificationSuiteAsync(
  {
    provider: 'DemoProvider',
    providerBaseUrl: `http://127.0.0.1:${port}`,
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
