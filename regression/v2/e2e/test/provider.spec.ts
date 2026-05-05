import path from 'node:path';
import { describe, it } from 'vitest';
import { Verifier } from '@pact-foundation/pact';
import { server, importData, animalRepository } from '../provider';

const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

const app = server.listen(8081, () => {
  importData();
  console.log('Animal Profile Service listening on http://localhost:8081');
});

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  it('validates the expectations of Matching Service', () => {
    let token = 'INVALID TOKEN';

    return new Verifier({
      logLevel: LOG_LEVEL,
      providerBaseUrl: 'http://localhost:8081',

      requestFilter: (req, _res, next) => {
        console.log(
          'Middleware invoked before provider API - injecting Authorization token',
        );
        req.headers.MY_SPECIAL_HEADER = 'my special value';

        // e.g. ADD Bearer token
        req.headers.authorization = `Bearer ${token}`;
        next();
      },

      stateHandlers: {
        'Has no animals': () => {
          animalRepository.clear();
          token = 'token';
          return Promise.resolve(`Animals removed to the db`);
        },
        'Has some animals': () => {
          token = 'token';
          importData();
          return Promise.resolve(`Animals added to the db`);
        },
        'Has an animal with ID 1': () => {
          token = 'token';
          importData();
          return Promise.resolve(`Animals added to the db`);
        },
        'is not authenticated': () => {
          token = '';
          return Promise.resolve(`Invalid bearer token generated`);
        },
        'is authenticated': () => {
          token = 'token';
          return Promise.resolve({ description: `Bearer token generated` });
        },
      },

      pactUrls: [
        path.resolve(
          __dirname,
          '..',
          'pacts',
          'e2e Consumer Example-e2e Provider Example.json',
        ),
      ],
    })
      .verifyProvider()
      .then((output) => {
        console.log('Pact Verification Complete!');
        console.log(output);
        app.close();
      });
  });
});
