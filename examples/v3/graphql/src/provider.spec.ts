import { Verifier, LogLevel } from '@pact-foundation/pact';
import { versionFromGitTag } from 'absolute-version';
import app from './provider';
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

let server: any;

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  before((done) => {
    server = app.listen(4000, () => {
      done();
    });
  });

  it('validates the expectations of Matching Service', () => {
    // lexical binding required here
    const opts = {
      // Local pacts
      // pactUrls: [path.resolve(process.cwd(), "./pacts/graphqlconsumer-graphqlprovider.json")],
      pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
      // If you're using the open source Pact Broker, use the username/password option as per below
      // pactBrokerUsername: process.env.PACT_BROKER_USERNAME
      // pactBrokerPassword: process.env.PACT_BROKER_PASSWORD
      //
      // if you're using a PactFlow broker, you must authenticate using the bearer token option
      // You can obtain the token from https://<your broker>.pactflow.io/settings/api-tokens
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      provider: 'GraphQLProvider',
      providerBaseUrl: 'http://localhost:4000/graphql',
      // Your version numbers need to be unique for every different version of your provider
      // see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
      // If you use git tags, then you can use absolute-version as we do here.
      providerVersion: versionFromGitTag(),
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
      logLevel: LOG_LEVEL as LogLevel,
    };

    return new Verifier(opts).verifyProvider().then((output) => {
      server.close();
    });
  });
});
