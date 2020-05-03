"use strict"

const { pactWith } = require("jest-pact")
const { Matchers } = require("@pact-foundation/pact")

const getMeCats = require("../").getMeCats

pactWith({ consumer: "MyConsumer", provider: "MyProvider" }, provider => {
  describe("Cats API", () => {
    const EXPECTED_BODY = [{ cat: 2 }, { cat: 3 }]

    beforeEach(() => {
      const interaction = {
        state: "i have a list of cats",
        uponReceiving: "a request for cats with given catId",
        withRequest: {
          method: "GET",
          path: "/cats",
          query: {
            "catId[]": Matchers.eachLike("1"),
          },
          headers: {
            Accept: "application/json",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: EXPECTED_BODY,
        },
      }

      return provider.addInteraction(interaction)
    })

    it("returns a successful body", () => {
      return getMeCats({
        url: provider.mockService.baseUrl,
      })
        .then(response => {
          expect(response.headers["content-type"]).toEqual("application/json")
          expect(response.data).toEqual(EXPECTED_BODY)
          expect(response.status).toEqual(200)
        })
        .then(() => provider.verify())
    })
  })
})
