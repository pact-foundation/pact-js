const pact = require('@pact-foundation/pact-node');
const path = require('path');
const {
  server,
  importData,
  animalRepository
} = require('../provider.js');

// Append some extra endpoints to mutate current state of the API
server.get('/states', (req, res) => {
  res.json({
    "Matching Service": ['Has some animals', 'Has no animals', 'Has an animal with ID 1']
  });
});

server.post('/setup', (req, res) => {
  const state = req.body.state;

  animalRepository.clear();
  switch (state) {
    case 'Has no animals':
      // do nothing
      break;
    default:
      importData();
  }

  res.end();
});
server.listen(8081, () => {
  console.log('Animal Profile Service listening on http://localhost:8081');
});

let opts = {
  providerBaseUrl: 'http://localhost:8081',
  providerStatesUrl: 'http://localhost:8081/states',
  providerStatesSetupUrl: 'http://localhost:8081/setup',
  pactUrls: ['https://test.pact.dius.com.au/pacts/provider/Animal%20Profile%20Service/consumer/Matching%20Service/latest'],
  pactBrokerUsername: 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M',
  pactBrokerPassword: 'O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1'
};

pact.verifyPacts(opts).then((res) => {
  console.log('Pact Verification Complete!');
  console.log(res);
  process.exit(0);
}).catch((error) => {
  console.log('Pact Verification Failed: ', error);
  process.exit(1);
});
