/*  tslint:disable: no-console*/
import {
  LogLevel,
  MessageProviderPact,
  providerWithMetadata,
} from '@pact-foundation/pact';
import { versionFromGitTag } from 'absolute-version';
const { createDog } = require('./dog-client');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

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
    logLevel: LOG_LEVEL as LogLevel,
    provider: 'MyJSMessageProvider',
    // Your version numbers need to be unique for every different version of your provider
    // see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
    // If you use git tags, then you can use absolute-version as we do here.
    providerVersion: versionFromGitTag(),
    // For local validation
    // pactUrls: [path.resolve(process.cwd(), "pacts", "myjsmessageconsumer-myjsmessageprovider.json")],
    // Broker validation
    pactBrokerUrl: 'https://test.pactflow.io/',
    pactBrokerUsername:
      process.env.PACT_BROKER_USERNAME || 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M',
    pactBrokerPassword:
      process.env.PACT_BROKER_PASSWORD || 'O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1',
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

  describe('send a dog event', () => {
    it('sends a valid dog', () => {
      return p.verify();
    });
  });
});
