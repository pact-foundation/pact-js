'use strict'

const expect = require('chai').expect
const path = require('path')
const Pact = require('pact')
const wrapper = require('@pact-foundation/pact-node')
const getMeDogs = require('../index').getMeDogs

describe('The Dog API', () => {
  let url = 'http://localhost'
  let provider

  const port = 8989
  const server = wrapper.createServer({
    port: port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
    consumer: 'MyConsumer',
    provider: 'MyProvider'
  })

  const EXPECTED_BODY = [{dog: 1}]

  after(() => {
    wrapper.removeAllServers()
  })

  afterEach(done => {
    server.delete().then(() => { done() })
  })

  beforeEach(done => {
    server.start().then(() => {
      provider = Pact({ consumer: 'MyConsumer', provider: 'MyProvider', port: port })
      done()
    })
  })

  describe('works', () => {
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
      provider.addInteraction(interaction).then(() => { done() })
    })

    afterEach(done => {
      provider.finalize().then(() => { done() })
    })

    it('successfully verifies', done => {
      const urlAndPort = { url: url, port: port }
      getMeDogs(urlAndPort)
        .then(provider.verify)
        .then(response => {
          expect(response).to.eql(JSON.stringify(EXPECTED_BODY))
          done()
        })
    })
  })
})
