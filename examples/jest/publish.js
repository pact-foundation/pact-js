let publisher = require('@pact-foundation/pact-node');
let path = require('path');

let opts = {
  providerBaseUrl: 'http://localhost:8080',
  pactFilesOrDirs: [path.resolve(process.cwd(), 'pacts')],
  pactBroker: 'https://localhost:3000',
  pactBrokerUsername: process.env.PACT_USERNAME,
  pactBrokerPassword: process.env.PACT_PASSWORD,
  consumerVersion: '2.0.0'
};

publisher.publishPacts(opts).then(() => done());


