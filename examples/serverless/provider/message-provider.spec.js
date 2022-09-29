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
    pactBrokerUrl: 'https://test.pactflow.io/',
    pactBrokerUsername:
      process.env.PACT_BROKER_USERNAME || 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M',
    pactBrokerPassword:
      process.env.PACT_BROKER_PASSWORD || 'O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1',
    publishVerificationResult: true,

    providerVersionBranch: process.env.GIT_BRANCH || 'master',

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
