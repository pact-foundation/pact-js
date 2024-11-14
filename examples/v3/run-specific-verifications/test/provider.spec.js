const { Verifier } = require('@pact-foundation/pact');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { server } = require('../provider.js');
const path = require('path');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

server.listen(8081, '127.0.0.1', () => {
  console.log('Service listening on http://127.0.0.1:8081');
});

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  it('filter by PACT_DESCRIPTION', () => {
    process.env.PACT_DESCRIPTION = 'a request to be used';
    return new Verifier({
      // provider: 'filter-provider',
      providerBaseUrl: 'http://127.0.0.1:8081',
      pactUrls: [
        path.resolve(process.cwd(), './filter-by-PACT_DESCRIPTION.json'),
      ],
      logLevel: LOG_LEVEL,
    })
      .verifyProvider()
      .then((output) => {
        console.log('Pact Verification Complete!');
        console.log('Result:', output);
      });
  });
  it('filter by PACT_PROVIDER_STATE', () => {
    process.env.PACT_PROVIDER_STATE = 'a state to be used';
    return new Verifier({
      // if the provider name is set, and we have PACT_BROKER_BASE_URL plus env var creds set
      // it will automatically attempt to retrieve from a pact broker via the default consumer version selectors.
      // if we are verifying a pact directory source, we do not need to add the provider name
      // as it is inferred from the pact file.

      // provider: 'filter-provider',
      providerBaseUrl: 'http://127.0.0.1:8081',
      pactUrls: [
        path.resolve(process.cwd(), './filter-by-PACT_PROVIDER_STATE.json'),
      ],
    })
      .verifyProvider()
      .then((output) => {
        console.log('Pact Verification Complete!');
        console.log('Result:', output);
      });
  });
  it('filter by PACT_PROVIDER_NO_STATE', () => {
    process.env.PACT_PROVIDER_NO_STATE = 'TRUE';
    return new Verifier({
      // provider: 'filter-provider',
      providerBaseUrl: 'http://127.0.0.1:8081',
      pactUrls: [
        path.resolve(process.cwd(), './filter-by-PACT_PROVIDER_NO_STATE.json'),
      ],
    })
      .verifyProvider()
      .then((output) => {
        console.log('Pact Verification Complete!');
        console.log('Result:', output);
      });
  });
});
