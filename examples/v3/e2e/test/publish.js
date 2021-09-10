const pact = require('@pact-foundation/pact-core');
const path = require('path');
const { versionFromGitTag } = require('@pact-foundation/absolute-version');

const pactBroker = 'https://test.pact.dius.com.au';
/* if (process.env.CI && !process.env.APPVEYOR) {
  pactBroker = 'http://localhost:9292';
} */

// Your version numbers need to be unique for every different version of your consumer
// see https://docs.pact.io/getting_started/versioning_in_the_pact_broker/ for details.
// If you use git tags, then you can use @pact-foundation/absolute-version as we do here.
const consumerVersion = versionFromGitTag();

const opts = {
  pactFilesOrDirs: [
    path.resolve(
      __dirname,
      '../pacts/Matching Service V3-Animal Profile Service V3.json'
    ),
  ],
  pactBroker: pactBroker,
  pactBrokerUsername: 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M',
  pactBrokerPassword: 'O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1',
  tags: ['prod', 'test'],
  consumerVersion: consumerVersion,
};

pact
  .publishPacts(opts)
  .then(() => {
    console.log('Pact contract publishing complete!');
    console.log('');
    if (!process.env.CI && !process.env.APPVEYOR) {
      console.log('Head over to https://test.pact.dius.com.au/ and login with');
      console.log('=> Username: dXfltyFMgNOFZAxr8io9wJ37iUpY42M');
      console.log('=> Password: O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1');
      console.log('to see your published contracts.');
    }
  })
  .catch((e) => {
    console.log('Pact contract publishing failed: ', e);
  });
