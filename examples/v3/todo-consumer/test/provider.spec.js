const { PactV3, MatchersV3, XmlBuilder } = require('@pact-foundation/pact');
const { Verifier } = require('@pact-foundation/pact');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { server } = require('../provider.js');
const path = require('path');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

server.listen(8081, () => {
  console.log('SOAP API listening on http://localhost:8081');
});

describe('Pact XML Verification', () => {
  it('validates the expectations of Matching Service', () => {
    const opts = {
      provider: 'XML Service',
      providerBaseUrl: 'http://localhost:8081',
      pactUrls: ['./pacts/TodoApp-TodoServiceV3.json'],
      stateHandlers: {
        'i have a list of projects': (params) => {},
        'i have a project': (params) => {},
      },
      logLevel: LOG_LEVEL,
    };

    return new Verifier(opts).verifyProvider().then((output) => {
      console.log('Pact Verification Complete!');
      console.log(output);
    });
  });
});
