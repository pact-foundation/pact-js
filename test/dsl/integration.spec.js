'use strict'

var path = require('path')
var expect = require('chai').expect
var Promise = require('bluebird')
var request = require('superagent')

var Pact = require('../../src/pact')
var Matchers = Pact.Matchers

describe('Integration', () => {

  ['http', 'https'].forEach((PROTOCOL) => {
      describe(`Pact on ${PROTOCOL} protocol`, (protocol) => {

      const MOCK_PORT = Math.floor(Math.random() * 999) + 9000
      const PROVIDER_URL = `${PROTOCOL}://localhost:${MOCK_PORT}`
      const provider = Pact({
        consumer: 'Matching Service',
        provider: 'Animal Profile Service',
        port: MOCK_PORT,
        log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
        dir: path.resolve(process.cwd(), 'pacts'),
        logLevel: 'INFO',
        ssl: (PROTOCOL === 'https'),
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

      let counter = 1

      before(provider.setup)

      // once all tests are run, write pact and remove interactions
      after(() => provider.finalize())

      context('with a single request', () => {

        // add interactions, as many as needed
        before((done) => {
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
          })
          .then(() => done())
        })

        // execute your assertions
        it('returns the correct body', (done) => {
          request
            .get(`${PROVIDER_URL}/projects`)
            .set({ 'Accept': 'application/json' })
            .then((res) => {
              expect(res.text).to.eql(JSON.stringify(EXPECTED_BODY))
            })
            .then(done)
        })

        // verify with Pact, and reset expectations
        it('successfully verifies', () => provider.verify())
      })

      context('with a single request with query string parameters', () => {

        // add interactions, as many as needed
        before((done) => {
          provider.addInteraction({
            state: 'i have a list of projects',
            uponReceiving: 'a request for projects with a filter',
            withRequest: {
              method: 'get',
              path: '/projects',
              query: { from: 'today' },
              headers: { 'Accept': 'application/json' }
            },
            willRespondWith: {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
              body: EXPECTED_BODY
            }
          })
          .then(() => done())
        })

        // execute your assertions
        it('returns the correct body', (done) => {
          request
            .get(`${PROVIDER_URL}/projects?from=today`)
            .set({ 'Accept': 'application/json' })
            .then((res) => {
              expect(res.text).to.eql(JSON.stringify(EXPECTED_BODY))
            })
            .then(done)
        })

        // verify with Pact, and reset expectations
        it('successfully verifies', () => provider.verify())
      })

      context('with a single request and matchers', () => {

        // add interactions, as many as needed
        before((done) => {
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

        // execute your assertions
        it('returns the correct body', (done) => {
          const verificationPromise = request
            .get(`${PROVIDER_URL}/projects`)
            .set({ 'Accept': 'application/json' })
            .then((res) => {
              return JSON.parse(res.text)[0]
            })

            expect(verificationPromise).to.eventually.have.lengthOf(4)
            expect(verificationPromise).to.eventually.have.property('tasks').notify(done)
        })

        // verify with Pact, and reset expectations
        it('successfully verifies', () => provider.verify())
      })

      context('with two requests', () => {

        before((done) => {
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

        it('allows two requests', (done) => {
          const verificationPromise =
            request.get(`${PROVIDER_URL}/projects`)
              .set({ 'Accept': 'application/json' })
              .then((res) => {
                return res.text
              })
          expect(verificationPromise).to.eventually.eql(JSON.stringify(EXPECTED_BODY)).notify(done)

          const verificationPromise404 =
            request.get(`${PROVIDER_URL}/projects/2`).set({ 'Accept': 'application/json' })
          expect(verificationPromise404).to.eventually.be.rejected
        })

        // verify with Pact, and reset expectations
        it('successfully verifies', () => provider.verify())
      })

      context('with an unexpected interaction', () => {
        // add interactions, as many as needed
        before((done) => {
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

          expect(verificationPromise).to.be.rejectedWith('Error: Pact verification failed - expected interactions did not match actual.').notify(done)
        })
      })
    })
  })
})
