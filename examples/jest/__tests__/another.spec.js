'use strict'

const path = require('path')
const Pact = require('../../../dist/pact').Pact
const getMeCats = require('../index').getMeCats

describe("Cat's API", () => {
  let url = 'http://localhost'

  const EXPECTED_BODY = [{
    cat: 2
  }]

  describe("another works", () => {
    beforeEach(() => {
      const interaction = {
        state: 'i have a list of games',
        uponReceiving: 'a request for games',
        withRequest: {
          method: 'GET',
          path: '/cats',
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
      return getMeCats({
          url,
          port
        })
        .then(response => {
          expect(response.headers['content-type']).toEqual('application/json')
          expect(response.data).toEqual(EXPECTED_BODY)
          expect(response.status).toEqual(200)
          done()
        })
        .then(() => provider.verify());
    })

    // verify with Pact, and reset expectations
    //afterEach(() => provider.verify())
  })
})
