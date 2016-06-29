import path from 'path'
import { expect } from 'chai'
import request from 'superagent'
import wrapper from '@pact-foundation/pact-node'

import Pact from '../../src/pact'
import Interceptor from '../../src/interceptor'

describe('Pact with Interceptor', () => {

  const MOCK_PORT = Math.floor(Math.random() * 999) + 9000
  const PROVIDER_PORT = Math.floor(Math.random() * 999) + 9000
  const PROVIDER_URL = `http://localhost:${PROVIDER_PORT}`
  const mockServer = wrapper.createServer({
    port: MOCK_PORT,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
  })

  const interceptor = new Interceptor(`http://localhost:${MOCK_PORT}`)

  const EXPECTED_BODY = [{
    id: 1,
    name: 'Project 1',
    due: '2016-02-11T09:46:56.023Z',
    tasks: [
      {id: 1, name: 'Do the laundry', 'done': true},
      {id: 2, name: 'Do the dishes', 'done': false},
      {id: 3, name: 'Do the backyard', 'done': false},
      {id: 4, name: 'Do nothing', 'done': false}
    ]
  }]

  var provider

  after(() => {
    wrapper.removeAllServers()
  })

  before((done) => {
    mockServer.start().then(() => {
      provider = Pact({
        consumer: 'Consumer Interceptor',
        provider: 'Provider Interceptor',
        port: MOCK_PORT
      })
      interceptor.interceptRequestsOn(PROVIDER_URL)
      done()
    })
  })

  after((done) => {
    provider.finalize()
      .then(() => mockServer.delete())
      .then(() => {
        interceptor.stopIntercepting()
        done()
      })
  })

  context('with a single request', () => {

    // add interactions, as many as needed
    beforeEach((done) => {
      provider.addInteraction({
        state: 'i have a list of projects',
        uponReceiving: 'a request for projects',
        withRequest: {
          method: 'get',
          path: '/projects',
          headers: { 'Accept': 'application/json' }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: EXPECTED_BODY
        }
      }).then(() => done())
    })

    // execute your assertions
    it('successfully verifies', (done) => {
      const verificationPromise = request
        .get(`${PROVIDER_URL}/projects`)
        .set({ 'Accept': 'application/json' })
        .then(provider.verify)

      expect(verificationPromise).to.eventually.eql(JSON.stringify(EXPECTED_BODY)).notify(done)
    })
  })

  context('with two requests', () => {

    beforeEach((done) => {
      let interaction2 = provider.addInteraction({
        state: 'i have a list of projects',
        uponReceiving: 'a request for a project that does not exist',
        withRequest: {
          method: 'get',
          path: '/projects/2',
          headers: { 'Accept': 'application/json' }
        },
        willRespondWith: {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      }).then(() => done())
    })

    it('successfully verifies', (done) => {
      let promiseResults = []

      const verificationPromise =
          request.get(`${PROVIDER_URL}/projects`)
            .set({ 'Accept': 'application/json' })
            .then((response) => {
              promiseResults.push(response)
              return request.get(`${PROVIDER_URL}/projects/2`).set({ 'Accept': 'application/json' })
            })
            .then(() => {}, (err) => { promiseResults.push(err.response) })
            .then(() => provider.verify(promiseResults))

      expect(verificationPromise).to.eventually.eql([JSON.stringify(EXPECTED_BODY), '']).notify(done)
    })
  })

  context('with an unexpected interaction', () => {
    it('fails verification', (done) => {
      let promiseResults = []

      const verificationPromise =
        request.get(`${PROVIDER_URL}/projects`)
          .set({ 'Accept': 'application/json' })
          .then((response) => {
            promiseResults.push(response)
            return request.delete(`${PROVIDER_URL}/projects/2`)
          })
          .then(() => {}, (err) => { promiseResults.push(err.response) })
          .then(() => provider.verify(promiseResults))

      expect(verificationPromise).to.be.rejectedWith('No interaction found for DELETE /projects/2').notify(done)
    })
  })

})
