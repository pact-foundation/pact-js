import path from 'path'
import { expect } from 'chai'
import Promise from 'bluebird'
import request from 'superagent'
import wrapper from '@pact-foundation/pact-node'

import { default as Pact, Matchers } from '../../src/pact'

['http', 'https'].forEach((PROTOCOL) => {

describe(`Pact random mock port, protocol: ${PROTOCOL}`, (protocol) => {

  const MOCK_PORT = Math.floor(Math.random() * 999) + 9000
  const PROVIDER_URL = `${PROTOCOL}://localhost:${MOCK_PORT}`
  const mockServer = wrapper.createServer({
    port: MOCK_PORT,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    ssl: PROTOCOL === 'https' ? true : false,
    spec: 2
  })

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

  var provider, counter = 1

  after(() => {
    wrapper.removeAllServers()
  })

  beforeEach((done) => {
    mockServer.start().then(() => {
      provider = Pact({ consumer: `Consumer ${counter}`,
                        provider: `Provider ${counter}`,
                        port: MOCK_PORT,
                        ssl: PROTOCOL === 'https' ? true : false
                      })
      done()
    })
  })

  afterEach((done) => {
    mockServer.delete().then(() => {
      counter++
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

    // once test is run, write pact and remove interactions
    afterEach((done) => {
      provider.finalize().then(() => done())
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

  context('with a single request and matchers', () => {

    // add interactions, as many as needed
    beforeEach((done) => {
      provider.addInteraction({
        state: 'i have a list of projects but I dont know how many',
        uponReceiving: 'a request for such projects',
        withRequest: {
          method: 'get',
          path: '/projects',
          headers: { 'Accept': 'application/json' }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': Matchers.term({ generate: 'application/json', matcher: 'application\/json' }) },
          body: [{
            id: 1,
            name: 'Project 1',
            due: '2016-02-11T09:46:56.023Z',
            tasks: Matchers.eachLike({
              id: Matchers.somethingLike(1),
              name: Matchers.somethingLike('Do the laundry'),
              'done': Matchers.somethingLike(true)
            }, { min: 4 })
          }]
        }
      }).then(() => done())
    })

    // once test is run, write pact and remove interactions
    afterEach((done) => {
      provider.finalize().then(() => done())
    })

    // execute your assertions
    it('successfully verifies', (done) => {
      const verificationPromise = request
        .get(`${PROVIDER_URL}/projects`)
        .set({ 'Accept': 'application/json' })
        .then(provider.verify)

      verificationPromise.then((data) => {
        let jsonData = JSON.parse(data)[0]
        expect(jsonData).to.have.property('tasks')
        expect(jsonData.tasks).to.have.lengthOf(4)
        done()
      })
    })
  })

  context('with two requests', () => {

    beforeEach((done) => {
      let interaction1 = provider.addInteraction({
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
      })

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
      })

      Promise.all([interaction1, interaction2]).then(() => done())
    })

    // once test is run, write pact and remove interactions
    afterEach((done) => {
      provider.finalize().then(() => done())
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

    // once test is run, write pact and remove interactions
    afterEach((done) => {
      provider.finalize().then(() => done())
    })

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

})
