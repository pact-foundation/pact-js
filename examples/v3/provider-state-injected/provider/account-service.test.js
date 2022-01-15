const path = require('path');
const { VerifierV3 } = require('@pact-foundation/pact/v3');
const { accountService } = require('./account-service');
const {
  Account,
  AccountNumber,
  accountRepository,
} = require('./account-repository');

describe('Account Service', () => {
  beforeAll((done) => accountService.listen(8081, done));
  afterAll((done) => {
    console.log('closing server!');
    accountService.close(done);
  });

  it('validates the expectations of Transaction Service', () => {
    let opts = {
      provider: 'Account Service',
      providerBaseUrl: 'http://localhost:8081',
      logLevel: 'trace',
      stateHandlers: {
        'Account Test001 exists': {
          setup: (params) => {
            let account = new Account(
              0,
              0,
              'Test001',
              params.accountRef,
              new AccountNumber(0),
              Date.now(),
              Date.now()
            );
            let persistedAccount = accountRepository.save(account);
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
          process.cwd(),
          './pacts/TransactionService-AccountService.json'
        ),
      ],
    };

    return new VerifierV3(opts).verifyProvider();
  });
});
