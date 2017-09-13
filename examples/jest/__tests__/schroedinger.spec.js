'use strict'

const path = require('path')
const Pact = require('../../../src/pact.js')
const getMeSchroedingersCats = require('../schroedinger').getMeSchroedingersCats

const { somethingLike: like, eachLike, term } = Pact.Matchers;

describe("Schroedinger's API", () => {
  let url = 'http://localhost'

  const port = 8989
  const provider = Pact({
    port: port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration-schroedinger.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
    consumer: 'MySchroedingerConsumer',
    provider: 'MyProvider'
  })

  const EXPECTED_BODY = {
    cats: eachLike({
      cat: {
        name: like('Erwin'),
        observed: term({
          generate: 'alive',
          matcher: 'alive|dead'
        }),
      }
    }, {min: 0}),
  }

  beforeAll(() => provider.setup())

  afterAll(() => provider.finalize())

  describe("works", () => {

    beforeAll(done => {
      const interaction = {
        state: 'i have a list of projects',
        uponReceiving: 'a request for projects',
        withRequest: {
          method: 'GET',
          path: '/schroedinger/cats',
          headers: { 'Accept': 'application/json' }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: EXPECTED_BODY
        }
      }
      provider.addInteraction(interaction).then(done, done)
    })

    // add expectations
    it('returns a sucessful body', done => {
      return getMeSchroedingersCats({ url, port })
        .then(response => {
          expect(response.headers['content-type']).toEqual('application/json')
          expect(response.status).toEqual(200)
          done()
        })
    })

    // verify with Pact, and reset expectations
    it('successfully verifies', () => provider.verify())
  })
})
