import path from 'path'
import { expect } from 'chai'
import Promise from 'bluebird'
import request from 'superagent-bluebird-promise'
import wrapper from '@pact-foundation/pact-node'

import { default as Pact, Interceptor } from '../../dist/pact'

describe('Pact random mock port', () => {

  const MOCK_PORT = Math.floor(Math.random() * 999) + 9000
  const PORT = Math.floor(Math.random() * 999) + 9000
  const PROVIDER_URL = `http://localhost:${PORT}`
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

  var pact, counter = 1

  after(() => {
    wrapper.removeAllServers()
  })

  beforeEach((done) => {
    mockServer.start().then(() => {
      pact = Pact({ consumer: `Test DSL ${counter}`, provider: `Projects ${counter}`, port: MOCK_PORT })
      interceptor.interceptRequestsOn(PROVIDER_URL)
      done()
    })
  })

  afterEach((done) => {
    mockServer.delete().then(() => {
      interceptor.stopIntercepting()
      counter++
      done()
    })
  })

  context('with a single request', () => {
    it('successfully verifies', (done) => {
      function requestProjects () {
        return request.get(`${PROVIDER_URL}/projects`).set({ 'Accept': 'application/json' })
      }

      pact.interaction()
        .given('i have a list of projects')
        .uponReceiving('a request for projects')
        .withRequest('get', '/projects', null, { 'Accept': 'application/json' })
        .willRespondWith(200, { 'Content-Type': 'application/json' }, EXPECTED_BODY)

      pact.verify(requestProjects)
        .then((data) => {
          expect(JSON.parse(data)).to.eql(EXPECTED_BODY)
          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })

  context('with two requests request', () => {
    it('successfully verifies', (done) => {
      function requestProjects () {
        return Promise.all([
          request.get(`${PROVIDER_URL}/projects`).set({ 'Accept': 'application/json' }),
          request.get(`${PROVIDER_URL}/projects/2`).set({ 'Accept': 'application/json' })
        ])
      }

      pact.interaction()
        .given('i have a list of projects')
        .uponReceiving('a request for projects')
        .withRequest('get', '/projects', null, { 'Accept': 'application/json' })
        .willRespondWith(200, { 'Content-Type': 'application/json' }, EXPECTED_BODY)

        pact.interaction()
          .given('i have a list of projects')
          .uponReceiving('a request for a project that does not exist')
          .withRequest('get', '/projects/2', null, { 'Accept': 'application/json' })
          .willRespondWith(404, { 'Content-Type': 'application/json' })

      pact.verify(requestProjects)
        .then((responses) => {
          expect(JSON.parse(responses[0])).to.eql(EXPECTED_BODY)
          expect(responses[1]).to.eql('')
          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })

  context('with an unexpected interaction', () => {
    it('fails verification', (done) => {
      function requestProjects () {
        return Promise.all([
          request.get(`${PROVIDER_URL}/projects`).set({ 'Accept': 'application/json' }),
          request.delete(`${PROVIDER_URL}/projects/2`)
        ])
      }

      pact.interaction()
        .given('i have a list of projects')
        .uponReceiving('a request for projects')
        .withRequest('get', '/projects', null, { 'Accept': 'application/json' })
        .willRespondWith(200, { 'Content-Type': 'application/json' }, EXPECTED_BODY)

      pact.verify(requestProjects)
        .catch((err) => {
          expect(err.shift()).to.contain('No interaction found for DELETE /projects/2')
          done()
        })
    })
  })

})
