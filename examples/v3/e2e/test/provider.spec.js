const { Verifier } = require('@pact-foundation/pact');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { server, importData, animalRepository } = require('../provider.js');
const path = require('path');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

const app = server.listen(8081, () => {
  console.log('Animal Profile Service listening on http://localhost:8081');
});

const pactBroker = 'https://test.pactflow.io';

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  it('validates the expectations of Matching Service', () => {
    let token = 'INVALID TOKEN';

    return new Verifier({
      logLevel: LOG_LEVEL,
      provider: 'Animal Profile Service V3',
      providerBaseUrl: 'http://localhost:8081',
      requestFilter: (req, res, next) => {
        console.log(
          'Middleware invoked before provider API - injecting Authorization token'
        );
        req.headers['MY_SPECIAL_HEADER'] = 'my special value';

        // e.g. ADD Bearer token
        req.headers['authorization'] = `Bearer ${token}`;
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
          animalRepository.first().id = parameters.id;
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

      // Fetch pacts from broker
      pactBrokerUrl: pactBroker,

      // Fetch from broker with given tags
      providerVersionTags: ['master'],
      providerVersionBranch: process.env.GIT_BRANCH || 'master',

      // Find _all_ pacts that match the current provider branch
      consumerVersionSelectors: [
        {
          matchingBranch: true,
        },
      ],
      enablePending: true,

      // Specific Remote pacts (doesn't need to be a broker)
      // pactUrls: ['https://test.pactflow.io/pacts/provider/Animal%20Profile%20Service/consumer/Matching%20Service/latest'],
      // Local pacts
      // pactUrls: [
      //   path.resolve(
      //     process.cwd(),
      //     './pacts/Matching Service V3-Animal Profile Service V3.json'
      //   ),
      // ],

      pactBrokerUsername:
        process.env.PACT_BROKER_USERNAME || 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M',
      pactBrokerPassword:
        process.env.PACT_BROKER_PASSWORD || 'O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1',
      publishVerificationResult: true,
      providerVersion: '1.0.0',
    })
      .verifyProvider()
      .then((output) => {
        console.log('Pact Verification Complete!');
        console.log('Result:', output);
        app.close();
      });
  });
});
