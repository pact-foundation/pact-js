const {
  MessageProviderPact,
  providerWithMetadata,
} = require('@pact-foundation/pact');
const { versionFromGitTag } = require('absolute-version');
const path = require('path');
const { createEvent } = require('./index');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

describe('Message provider tests', () => {
  const p = new MessageProviderPact({
    messageProviders: {
      'a request to save an event': providerWithMetadata(() => createEvent(), {
        'content-type': 'application/json',
      }),
    },
    logLevel: LOG_LEVEL,
    provider: 'SNSPactEventProvider',

    // Your version numbers need to be unique for every different version of your provider
    // see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
    // If you use git tags, then you can use absolute-version as we do here.
    providerVersion: versionFromGitTag(),

    // For local validation
    // pactUrls: [path.resolve(process.cwd(), "pacts", "snspacteventconsumer-snspacteventprovider.json")],

    // Uncomment to use the broker
    pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
    // If you're using the open source Pact Broker, use the username/password option as per below
    // pactBrokerUsername: process.env.PACT_BROKER_USERNAME
    // pactBrokerPassword: process.env.PACT_BROKER_PASSWORD
    //
    // if you're using a PactFlow broker, you must authenticate using the bearer token option
    // You can obtain the token from https://<your broker>.pactflow.io/settings/api-tokens
    pactBrokerToken: process.env.PACT_BROKER_TOKEN,
    publishVerificationResult: true,

    providerVersionBranch: process.env.GIT_BRANCH || 'master',

    // Find _all_ pacts that match the current provider branch
    consumerVersionSelectors: [
      {
        matchingBranch: true,
      },
      {
        mainBranch: true,
      },
      {
        deployedOrReleased: true,
      },
    ],
  });

  describe('send an event', () => {
    it('sends a valid event', () => {
      return p.verify();
    });
  });
});
