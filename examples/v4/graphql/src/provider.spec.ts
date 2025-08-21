import { Verifier, LogLevel } from '@pact-foundation/pact';

import app from './provider';
import * as path from 'path';

const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

let server: any;

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  before((done) => {
    server = app.listen(4000, () => {
      done();
    });
  });

  it('validates the expectations of Matching Service', () => {
    const opts = {
      pactUrls: [
        path.resolve(
          process.cwd(),
          './pacts/GraphQLConsumerV4-GraphQLProviderV4.json'
        ),
      ],
      providerBaseUrl: 'http://localhost:4000/graphql',
      logLevel: LOG_LEVEL as LogLevel,
    };

    return new Verifier(opts).verifyProvider().then(() => {
      server.close();
    });
  });
});
