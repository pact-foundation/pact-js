import path from 'node:path';
import { Verifier } from '@pact-foundation/pact';
import { afterEach, beforeEach, describe, it } from 'vitest';
import { server } from '../provider';

const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

server.listen(8085, '127.0.0.1', () => {
  console.log('Service listening on http://127.0.0.1:8085');
});

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  const PACT_ENV_VARS = [
    'PACT_DESCRIPTION',
    'PACT_PROVIDER_STATE',
    'PACT_PROVIDER_NO_STATE',
  ];

  beforeEach(() => {
    PACT_ENV_VARS.forEach((key) => {
      delete process.env[key];
    });
  });

  afterEach(() => {
    PACT_ENV_VARS.forEach((key) => {
      delete process.env[key];
    });
  });

  it('filter by PACT_DESCRIPTION', () => {
    process.env.PACT_DESCRIPTION = 'a request to be used';
    return new Verifier({
      // provider: 'filter-provider',
      providerBaseUrl: 'http://127.0.0.1:8085',
      pactUrls: [
        path.resolve(__dirname, '..', 'filter-by-PACT_DESCRIPTION.json'),
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
      // provider: 'filter-provider',
      providerBaseUrl: 'http://127.0.0.1:8085',
      pactUrls: [
        path.resolve(__dirname, '..', 'filter-by-PACT_PROVIDER_STATE.json'),
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
      providerBaseUrl: 'http://127.0.0.1:8085',
      pactUrls: [
        path.resolve(__dirname, '..', 'filter-by-PACT_PROVIDER_NO_STATE.json'),
      ],
    })
      .verifyProvider()
      .then((output) => {
        console.log('Pact Verification Complete!');
        console.log('Result:', output);
      });
  });
});
