const path = require('path');
const { Verifier } = require('@pact-foundation/pact');
const { accountService } = require('./account-service');
const {
  Account,
  AccountNumber,
  accountRepository,
} = require('./account-repository');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

describe('Account Service', () => {
  let server;
  beforeAll(() => (server = accountService.listen(8081)));
  afterAll((done) => {
    console.log('closing server!');
    server.close(done);
  });

  it('validates the expectations of Transaction Service', () => {
    let opts = {
      // if the provider name is set, and we have PACT_BROKER_BASE_URL plus env var creds set
      // it will automatically attempt to retrieve from a pact broker via the default consumer version selectors.
      // if we are verifying a pact directory source, we do not need to add the provider name
      // as it is inferred from the pact file.
      // this doesn't feel like desirable behavior (we should only verify one source at a time!)
      // see https://github.com/pact-foundation/pact-reference/issues/250
      // provider: 'Account Service',
      providerBaseUrl: 'http://localhost:8081',
      logLevel: LOG_LEVEL,
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

    return new Verifier(opts).verifyProvider();
  });
});
