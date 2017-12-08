'use strict'

const path = require('path')
const Pact = require('../../../dist/pact').Pact
const getMeDogs = require('../index').getMeDogs

describe("Dog's API", () => {
  let url = 'http://localhost'

  const port = 8989
  const provider = new Pact({
    port: port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
    consumer: 'MyConsumer',
    provider: 'MyProvider'
  })

  const EXPECTED_BODY = [{
    dog: 1
  }]

  beforeAll(() => provider.setup())

  afterAll(() => provider.finalize())

  describe("works", () => {
    beforeAll(() => {
      const interaction = {
        state: 'i have a list of projects',
        uponReceiving: 'a request for projects',
        withRequest: {
          method: 'GET',
          path: '/dogs',
          headers: {
            'Accept': 'application/json'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: EXPECTED_BODY
        }
      }
      return provider.addInteraction(interaction)
    })

    // add expectations
    it('returns a sucessful body', done => {
      return getMeDogs({
          url,
          port
        })
        .then(response => {
          expect(response.headers['content-type']).toEqual('application/json')
          expect(response.data).toEqual(EXPECTED_BODY)
          expect(response.status).toEqual(200)
          done()
        })
    })

    // verify with Pact, and reset expectations
    it('successfully verifies', () => provider.verify())
  })
})
