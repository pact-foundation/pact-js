const {
  Verifier
} = require('../../../dist/pact')
const path = require('path')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect
const {
  VerifierOptions
} = require('@pact-foundation/pact-node');
chai.use(chaiAsPromised)
const {
  server,
  importData,
  animalRepository
} = require('../provider.js')

server.post('/setup', (req, res) => {
  const state = req.body.state

  animalRepository.clear()
  switch (state) {
    case 'Has no animals':
      // do nothing
      break
    default:
      importData()
  }

  res.end()
})

server.listen(8081, () => {
  console.log('Animal Profile Service listening on http://localhost:8081')
})

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  it('should validate the expectations of Matching Service', () => {

    let opts = {
      provider: 'Animal Profile Service',
      providerBaseUrl: 'http://localhost:8081',
      providerStatesSetupUrl: 'http://localhost:8081/setup',
      // Fetch pacts from broker
      pactBrokerUrl: 'https://test.pact.dius.com.au/',
      // Fetch from broker with given tags
      tags: ['prod', 'sit5'],
      // Specific Remote pacts (doesn't need to be a broker)
      // pactUrls: ['https://test.pact.dius.com.au/pacts/provider/Animal%20Profile%20Service/consumer/Matching%20Service/latest'],
      // Local pacts
      // pactUrls: [path.resolve(process.cwd(), './pacts/matching_service-animal_profile_service.json')],
      pactBrokerUsername: 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M',
      pactBrokerPassword: 'O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1',
      publishVerificationResult: true,
      providerVersion: "1.0.0",
      customProviderHeaders: ['Authorization: basic e5e5e5e5e5e5e5']
    }

    return new Verifier().verifyProvider(opts)
      .then(output => {
        console.log('Pact Verification Complete!')
        console.log(output)
      })
  })
})
