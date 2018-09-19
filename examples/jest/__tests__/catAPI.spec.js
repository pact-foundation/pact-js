'use strict'

const path = require('path')
const { Pact, Matchers } = require('../../../dist/pact')
const getMeCats = require('../').getMeCats

describe("Cat's API", () => {
  let url = 'http://localhost'

  describe("another works", () => {
    it('returns a successful body', async () => {
      // add expectations
      const EXPECTED_BODY = [
        { cat: 2 }, { cat: 3 }
      ]

      const interaction = {
        state: 'i have a list of cats',
        uponReceiving: 'a request for cats with given catId',
        withRequest: {
          method: 'GET',
          path: '/cats',
          query: {
            'catId[]': Matchers.eachLike('1'),
          },
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

      await provider.addInteraction(interaction)

      const response = await getMeCats({
        url,
        port
      })

      expect(response.headers['content-type']).toEqual('application/json')
      expect(response.data).toEqual(EXPECTED_BODY)
      expect(response.status).toEqual(200)

      return provider.verify()
    })
  })
})
