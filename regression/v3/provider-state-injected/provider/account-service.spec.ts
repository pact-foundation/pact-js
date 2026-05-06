import path from 'node:path';
import { Verifier } from '@pact-foundation/pact';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  Account,
  AccountNumber,
  accountRepository,
} from './account-repository';
import { accountService } from './account-service';

const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('Account Service', () => {
  let server: ReturnType<typeof accountService.listen>;
  beforeAll(() => (server = accountService.listen(8083)));
  afterAll((done) => {
    console.log('closing server!');
    server.close(done);
  });

  it('validates the expectations of Transaction Service', () => {
    const opts = {
      // provider: 'Account Service',
      providerBaseUrl: 'http://localhost:8083',
      logLevel: LOG_LEVEL,
      stateHandlers: {
        'Account Test001 exists': {
          setup: (params) => {
            const account = new Account(
              0,
              0,
              'Test001',
              params.accountRef,
              new AccountNumber(0),
              Date.now(),
              Date.now(),
            );
            const persistedAccount = accountRepository.save(account);
            return Promise.resolve({
              accountNumber: persistedAccount.accountNumber.id,
            });
          },
        },
        'set id': {
          setup: (params) => Promise.resolve({ id: params.id }),
        },
        'set path': {
          setup: (params) =>
            Promise.resolve({ id: params.id, path: params.path }),
        },
      },

      pactUrls: [
        path.resolve(
          __dirname,
          '..',
          'pacts',
          'TransactionService-AccountService.json',
        ),
      ],
    };

    return new Verifier(opts).verifyProvider();
  });
});
