import path from 'node:path';
import { Verifier } from '@pact-foundation/pact';
import { describe, it } from 'vitest';
import { server } from '../provider';

const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

server.listen(8084, () => {
  console.log('SOAP API listening on http://localhost:8084');
});

describe('Pact XML Verification', () => {
  it('validates the expectations of Matching Service', () => {
    const opts = {
      // provider: 'XML Service',
      providerBaseUrl: 'http://localhost:8084',
      pactUrls: [
        path.resolve(__dirname, '..', 'pacts', 'TodoApp-TodoServiceV3.json'),
      ],
      stateHandlers: {
        'i have a list of projects': (_params) => {},
        'i have a project': (_params) => {},
      },
      logLevel: LOG_LEVEL,
    };

    return new Verifier(opts).verifyProvider().then((output) => {
      console.log('Pact Verification Complete!');
      console.log(output);
    });
  });
});
