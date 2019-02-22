/* tslint:disable:no-unused-expression */
import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import * as nock from "nock"
import { HTTPMethod } from "../common/request"
import { Interaction } from "./interaction"
import { MockService } from "./mockService"

chai.use(chaiAsPromised)
const expect = chai.expect

describe("MockService", () => {
  after(() => {
    nock.restore()
  })

  describe("#constructor", () => {
    it("creates a MockService when all mandatory parameters are provided", () => {
      const mock = new MockService("consumer", "provider", 1234)
      expect(mock.baseUrl).to.eql("http://127.0.0.1:1234")
    })

    it("creates a MockService when all mandatory parameters are provided", () => {
      const mock = new MockService(
        "consumer",
        "provider",
        4443,
        "127.0.0.2",
        true
      )
      expect(mock.baseUrl).to.eql("https://127.0.0.2:4443")
    })

    it("creates a MockService when port is not provided", () => {
      const mock = new MockService("consumer", "provider")
      expect(mock).to.not.be.undefined
      expect(mock.baseUrl).to.eql("http://127.0.0.1:1234")
    })

    it("does not create a MockService when consumer is not provided", () => {
      expect(() => {
        new MockService("", "provider")
      }).not.to.throw(Error)
    })

    it("does not create a MockService when provider is not provided", () => {
      expect(() => {
        new MockService("consumer", "")
      }).not.to.throw(Error)
    })
  })

  describe("#addInteraction", () => {
    const mock = new MockService("consumer", "provider", 1234)

    const interaction = new Interaction()
    interaction
      .uponReceiving("duh")
      .withRequest({ method: HTTPMethod.GET, path: "/search" })
      .willRespondWith({ status: 200 })

    it("when Interaction added successfully", () => {
      nock(mock.baseUrl)
        .post(/interactions$/)
        .reply(200)

      return expect(mock.addInteraction(interaction)).to.eventually
    })

    it("when Interaction fails to be added", () => {
      nock(mock.baseUrl)
        .post(/interactions$/)
        .reply(500)
      return expect(mock.addInteraction(interaction)).to.eventually.be.rejected
    })
  })

  describe("#removeInteractions", () => {
    const mock = new MockService("consumer", "provider", 1234)

    it("when interactions are removed successfully", () => {
      nock(mock.baseUrl)
        .delete(/interactions$/)
        .reply(200)

      return expect(mock.removeInteractions()).to.eventually.be.fulfilled
    })

    it("when interactions fail to be removed", () => {
      nock(mock.baseUrl)
        .delete(/interactions$/)
        .reply(500)

      return expect(mock.removeInteractions()).to.eventually.be.rejected
    })
  })

  describe("#verify", () => {
    const mock = new MockService("consumer", "provider", 1234)

    it("when verification is successful", () => {
      nock(mock.baseUrl)
        .get(/interactions\/verification$/)
        .reply(200)

      return expect(mock.verify()).to.eventually.be.fulfilled
    })

    it("when verification fails", () => {
      nock(mock.baseUrl)
        .get(/interactions\/verification$/)
        .reply(500)

      return expect(mock.verify()).to.eventually.be.rejected
    })
  })

  describe("#writePact", () => {
    describe("when consumer and provider details provided", () => {
      const mock = new MockService("aconsumer", "aprovider", 1234)

      describe("and writing is successful", () => {
        it("writes the consumer and provider details into the pact", () => {
          nock(mock.baseUrl)
            .post(/pact$/, {
              consumer: { name: "aconsumer" },
              pactfile_write_mode: "overwrite",
              provider: { name: "aprovider" },
            })
            .reply(200)

          return expect(mock.writePact()).to.eventually.be.fulfilled
        })
      })

      describe("and writing fails", () => {
        it("returns a rejected promise", () => {
          nock(mock.baseUrl)
            .post(/pact$/, {})
            .reply(500)

          return expect(mock.writePact()).to.eventually.be.rejected
        })
      })
    })

    describe("when consumer and provider details are not provided", () => {
      const mock = new MockService(undefined, undefined, 1234)
      it("does not write the consumer and provider details into the pact", () => {
        nock(mock.baseUrl)
          .post(/pact$/)
          .reply(200)

        return expect(mock.writePact()).to.eventually.be.fulfilled
      })
    })
  })
})
