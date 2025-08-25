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
    // pactUrls: [
    //   path.resolve(
    //     process.cwd(),
    //     'pacts',
    //     'MyJSMessageConsumerV4-MyJSMessageProviderV4.json'
    //   ),
    // ],
    // Your version numbers need to be unique for every different version of your provider
    // see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
    // If you use git tags, then you can use absolute-version as we do here.
    providerVersion: versionFromGitTag(),
    // For local validation
    // pactUrls: [path.resolve(process.cwd(), "pacts", "myjsmessageconsumer-myjsmessageprovider.json")],
    // Broker validation
    pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
    // If you're using the open source Pact Broker, use the username/password option as per below
    // pactBrokerUsername: process.env.PACT_BROKER_USERNAME
    // pactBrokerPassword: process.env.PACT_BROKER_PASSWORD
    //
    // if you're using a PactFlow broker, you must authenticate using the bearer token option
    // You can obtain the token from https://<your broker>.pactflow.io/settings/api-tokens
    pactBrokerToken: process.env.PACT_BROKER_TOKEN,
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
