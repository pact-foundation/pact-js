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

  beforeAll(() => provider.setup())

  afterAll(() => provider.finalize())

  describe("no cats works", () => {
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

    beforeAll(done => {
      const interaction = {
        state: 'schroedinger has an empty box',
        uponReceiving: 'a request for schroedingers cats',
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

  describe("one or more cats works", () => {
    const EXPECTED_BODY = {
      cats: eachLike({
        cat: {
          name: like('Erwin'),
          observed: term({
            generate: 'alive',
            matcher: 'alive|dead'
          }),
        }
      }, {min: 1}),
    }

    beforeAll(done => {
      const interaction = {
        state: 'schroedinger has put a cat in the box',
        uponReceiving: 'a request for schroedingers cats',
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
