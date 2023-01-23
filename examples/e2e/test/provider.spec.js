const { Verifier } = require('@pact-foundation/pact');
const { versionFromGitTag } = require('absolute-version');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { server, importData, animalRepository } = require('../provider.js');
const path = require('path');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

const app = server.listen(8081, () => {
  importData();
  console.log('Animal Profile Service listening on http://localhost:8081');
});

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  it('validates the expectations of Matching Service', () => {
    let token = 'INVALID TOKEN';

    return new Verifier({
      provider: 'e2e Provider Example',
      logLevel: LOG_LEVEL,
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

      // Fetch pacts from broker
      pactBrokerUrl: 'https://test.pactflow.io/',

      // Fetch from broker with given tags
      // consumerVersionTags: ['master', 'test', 'prod', 'feat/v3.0.0'],

      // Tag provider version with given tags
      providerVersionTags: ['master'], // in real code, this would be dynamically set by process.env.GIT_BRANCH
      providerVersionBranch: process.env.GIT_BRANCH || 'master',

      // Find _all_ pacts that match the current provider branch
      consumerVersionSelectors: [
        {
          matchingBranch: true,
        },
      ],

      // Enables "pending pacts" feature
      enablePending: true,

      // Specific Remote pacts (doesn't need to be a broker)
      // pactUrls: ['https://test.pactflow.io/pacts/provider/Animal%20Profile%20Service/consumer/Matching%20Service/latest'],
      // Local pacts
      // pactUrls: [
      //   path.resolve(
      //     process.cwd(),
      //     "./pacts/matching_service-animal_profile_service.json"
      //   ),
      // ],

      // If you're NOT using Pactflow, use the username/password option as per below
      pactBrokerUsername:
        process.env.PACT_BROKER_USERNAME || 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M',
      pactBrokerPassword:
        process.env.PACT_BROKER_PASSWORD || 'O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1',

      // if you're using Pactflow, you must authenticate using the bearer token option
      // You can obtain the token from https://<your broker>.pactflow.io/settings/api-tokens
      // pactBrokerToken: "<insert your token here"
      publishVerificationResult: true,
      // Your version numbers need to be unique for every different version of your provider
      // see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
      // If you use git tags, then you can use absolute-version as we do here.
      providerVersion: versionFromGitTag(),
    })
      .verifyProvider()
      .then((output) => {
        console.log('Pact Verification Complete!');
        console.log(output);
        app.close();
      });
  });
});
