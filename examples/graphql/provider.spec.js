const {
  Verifier
} = require('../../dist/pact')
const path = require('path')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect
const { VerifierOptions } = require('@pact-foundation/pact-node');
const { app } = require('./provider.js')

chai.use(chaiAsPromised)
const server = app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));

// Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  it('should validate the expectations of Matching Service', function () { // lexical binding required here
    let opts = {
      provider: 'GraphQLProvider',
      providerBaseUrl: 'http://localhost:4000/graphql',
      // Local pacts
      pactUrls: [path.resolve(process.cwd(), './pacts/graphqlconsumer-graphqlconsumerprovider.json')],
      providerVersion: "1.0.0",
    }

    return new Verifier().verifyProvider(opts)
      .then(output => {
        console.log('Pact Verification Complete!')
        console.log(output)
        server.close();
      })
  })
})
