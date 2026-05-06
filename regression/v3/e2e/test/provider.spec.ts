import path from 'node:path';
import querystring from 'node:querystring';
import { Verifier } from '@pact-foundation/pact';
import { describe, it } from 'vitest';
import { animalRepository, importData, server } from '../provider';

const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

const app = server.listen(8082, () => {
  console.log('Animal Profile Service listening on http://localhost:8082');
});

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  it('validates the expectations of Matching Service', () => {
    let token = 'INVALID TOKEN';

    return new Verifier({
      logLevel: LOG_LEVEL,
      providerBaseUrl: 'http://localhost:8082',
      requestFilter: (req, _res, next) => {
        console.log(
          'Middleware invoked before provider API - injecting Authorization token',
        );
        req.headers.MY_SPECIAL_HEADER = 'my special value';

        // e.g. ADD Bearer token
        req.headers.authorization = `Bearer ${token}`;

        // Workaround for https://github.com/pact-foundation/pact-js/issues/884:
        // The pact-js proxy JSON.stringifies parsed form-urlencoded bodies, changing
        // their byte length while forwarding the original Content-Length header. Re-
        // encoding the already-parsed object back to URL-encoded bytes (a Buffer)
        // causes parseBody.js to forward the bytes verbatim, preserving Content-Length.
        if (
          req.headers['content-type']?.includes(
            'application/x-www-form-urlencoded',
          ) &&
          req.body &&
          typeof req.body === 'object' &&
          !Buffer.isBuffer(req.body)
        ) {
          const urlencoded = querystring.stringify(req.body);
          req.body = Buffer.from(urlencoded);
          req.headers['content-length'] = String(req.body.length);
        }

        next();
      },

      stateHandlers: {
        'Has no animals': () => {
          animalRepository.clear();
          return Promise.resolve({
            description: `Animals removed from the db`,
          });
        },
        'Has some animals': () => {
          importData();
          return Promise.resolve({
            description: `Animals added to the db`,
            count: animalRepository.count(),
          });
        },
        'Has an animal with ID': (parameters) => {
          importData();
          const animal =
            animalRepository.fetchAll().find((a) => a.first_name === 'Nanny') ||
            animalRepository.first();
          animal.id = parameters.id;
          return Promise.resolve({
            description: `Animal with ID ${parameters.id} added to the db`,
            id: parameters.id,
          });
        },
        'is not authenticated': () => {
          token = '';
          return Promise.resolve({
            description: `Invalid bearer token generated`,
          });
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
          'Matching Service V3-Animal Profile Service V3.json',
        ),
      ],
    })
      .verifyProvider()
      .then((output) => {
        console.log('Pact Verification Complete!');
        console.log('Result:', output);
        app.close();
      });
  });
});
