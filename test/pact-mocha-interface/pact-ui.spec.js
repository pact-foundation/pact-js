// import { expect } from 'chai'
//
// Pact.Consumer('Consumer', 'Provider', (pact) => {
//
//   before(() => {
//     // this is optional
//     // otherwise we will intercept every HTTP request
//     pact.intercept('localhost', 9980)
//   })
//
//   after(() => {
//     pact.finish()
//   })
//
//   it('verify interaction X', (done) => {
//     pact
//       .given('aaaaa')
//       .uponReceiving('a request for projects')
//       .withRequest('get', '/projects')
//       .willRespondWith(200, { 'Content-Type': 'application/json' }, body)
//
//     pact.verify(() => client.getProjects()), done)
//   })
//
//   it('verify interaction Y', (done) => {
//     pact.addInteraction()
//     // trigger request here
//     expect(pact.verify()).to.eventually.have.been.fullfiled
//   })
//
// })
