'use strict'

const path = require('path')
const Pact = require('pact')
const wrapper = require('@pact-foundation/pact-node')
const getMeDogs = require('../index').getMeDogs

describe("Dog's API", () => {
  let url = 'http://localhost'
  let provider

  const port = 8989;
  const server = wrapper.createServer({
    port: port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
    consumer: 'MyConsumer',
    provider: 'MyProvider'
  })

  const EXPECTED_BODY = [{dog: 1}]

  afterAll(() => {
    wrapper.removeAllServers();
  })

  afterEach(done => {
    server.delete().then(done)
  });

  beforeEach(done => {
    server.start().then(() => {
      provider = Pact({ consumer: 'MyConsumer', provider: 'MyProvider', port: port })
      done()
    })
  });

  describe("works", () => {
    beforeEach(done => {
      const interaction = {
        state: 'i have a list of projects',
        uponReceiving: 'a request for projects',
        withRequest: {
          method: 'GET',
          path: '/dogs',
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

    afterEach(done => {
       return provider.finalize().then(done, done)
    })

    it('successfully verifies', done => {
      return getMeDogs({ url, port })
        .then(provider.verify)
        .then(response => {
          expect(response.headers['content-type']).toEqual('application/json');
          expect(response.data).toEqual(EXPECTED_BODY);
          expect(response.status).toEqual(200);
        })
        .then(done, done)
    })
  })
})
