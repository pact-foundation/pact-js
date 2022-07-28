const {
  MessageProviderPact,
  providerWithMetadata,
} = require('@pact-foundation/pact');
const { versionFromGitTag } = require('@pact-foundation/absolute-version');
const path = require('path');
const { createEvent } = require('./index');

describe('Message provider tests', () => {
  const p = new MessageProviderPact({
    messageProviders: {
      'a request to save an event': providerWithMetadata(() => createEvent(), {
        'content-type': 'application/json',
      }),
    },
    logLevel: 'WARN',
    provider: 'SNSPactEventProvider',

    // Your version numbers need to be unique for every different version of your provider
    // see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
    // If you use git tags, then you can use absolute-version as we do here.
    providerVersion: versionFromGitTag(),

    // For local validation
    // pactUrls: [path.resolve(process.cwd(), "pacts", "snspacteventconsumer-snspacteventprovider.json")],

    // Uncomment to use the broker
    pactBrokerUrl: 'https://test.pactflow.io/',
    pactBrokerUsername:
      process.env.PACT_BROKER_USERNAME || 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M',
    pactBrokerPassword:
      process.env.PACT_BROKER_PASSWORD || 'O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1',
    publishVerificationResult: true,

    providerBranch: process.env.GIT_BRANCH || 'feat/v3.0.0',

    // Find _all_ pacts that match the current provider branch
    consumerVersionSelectors: [
      {
        matchingBranch: true,
      },
    ],
  });

  describe('send an event', () => {
    it('sends a valid event', () => {
      return p.verify();
    });
  });
});
