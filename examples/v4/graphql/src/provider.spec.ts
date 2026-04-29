import { Verifier, type LogLevel } from '@pact-foundation/pact';

import app from './provider';
import type * as http from 'node:http';
import * as path from 'node:path';

const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

let server: http.Server;

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
          './pacts/GraphQLConsumerV4-GraphQLProviderV4.json',
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
