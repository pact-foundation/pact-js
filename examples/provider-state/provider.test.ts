import type { Server } from 'node:http';
import path from 'node:path';
import { type LogLevel, Verifier } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { clearAccounts, createApp, seedAccount } from './provider';

describe('AccountService', () => {
  let server: Server;

  beforeAll(() => {
    server = createApp().listen(3006);
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it(
    'satisfies all AccountConsumer expectations',
    () =>
      new Verifier({
        providerBaseUrl: 'http://localhost:3006',
        pactUrls: [
          path.resolve(
            process.cwd(),
            'pacts/AccountConsumer-AccountService.json',
          ),
        ],
        stateHandlers: {
          // Parameterised state handler: receives { accountNumber: 'ACC-001' }
          // and must return { accountId: <generated id> } to satisfy
          // fromProviderState('${accountId}', ...).
          'an account with number {accountNumber} exists': async (
            parameters: Record<string, string> = {},
          ) => {
            clearAccounts();
            const accountNumber = parameters.accountNumber ?? '';
            const id = seedAccount(accountNumber, 'Jane Smith');
            // The returned object populates the generator expressions.
            return { accountId: id };
          },
        },
        logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
      }).verifyProvider(),
    30_000,
  );
});
