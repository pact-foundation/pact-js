/*  tslint:disable: no-console*/
import {
  MessageProviderPact,
  providerWithMetadata,
} from '@pact-foundation/pact';
import { versionFromGitTag } from '@pact-foundation/absolute-version';
const { createDog } = require('./dog-client');

describe('Message provider tests', () => {
  const p = new MessageProviderPact({
    messageProviders: {
      'a request for a dog': providerWithMetadata(() => createDog(27), {
        queue: 'animals',
      }),
    },
    stateHandlers: {
      'some state': () => {
        // TODO: prepare system useful in order to create a dog
        console.log('State handler: setting up "some state" for interaction');
        return Promise.resolve(`state set to create a dog`);
      },
    },
    logLevel: 'info',
    provider: 'MyJSMessageProvider',
    // Your version numbers need to be unique for every different version of your provider
    // see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
    // If you use git tags, then you can use @pact-foundation/absolute-version as we do here.
    providerVersion: versionFromGitTag(),
    // For local validation
    // pactUrls: [path.resolve(process.cwd(), "pacts", "myjsmessageconsumer-myjsmessageprovider.json")],
    // Broker validation
    pactBrokerUrl: 'https://test.pactflow.io/',
    pactBrokerUsername:
      process.env.PACT_BROKER_USERNAME || 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M',
    pactBrokerPassword:
      process.env.PACT_BROKER_PASSWORD || 'O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1',
    providerBranch: process.env.GIT_BRANCH || 'feat/v3.0.0',

    // Find _all_ pacts that match the current provider branch
    consumerVersionSelectors: [
      {
        matchingBranch: true,
      },
    ],
  });

  describe('send a dog event', () => {
    it('sends a valid dog', () => {
      return p.verify();
    });
  });
});
