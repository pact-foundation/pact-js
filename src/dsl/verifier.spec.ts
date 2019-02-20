/* tslint:disable:no-unused-expression no-empty no-string-literal*/
import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import * as sinon from "sinon"
import { Verifier, VerifierOptions } from "./verifier"
import serviceFactory from "@pact-foundation/pact-node"
import logger from "../common/logger"

chai.use(chaiAsPromised)

const expect = chai.expect

describe("Verifier", () => {
  afterEach(() => {
    sinon.restore()
  })

  const state = "thing exists"
  let v: Verifier
  let opts: VerifierOptions
  let executed: boolean
  const providerBaseUrl = "http://not.exists"

  beforeEach(() => {
    executed = false
    opts = {
      providerBaseUrl,
      requestFilter: (req, res, next) => {
        executed = true
        next()
      },
      stateHandlers: {
        [state]: () => {
          return Promise.resolve("done")
        },
      },
    }
  })

  describe("#constructor", () => {
    describe("when given configuration", () => {
      it("sets the configuration on the object", () => {
        v = new Verifier(opts)
        expect(v)
          .to.have.deep.property("config")
          .includes({
            providerBaseUrl,
          })
        expect(v).to.have.nested.property("config.stateHandlers")
        expect(v).to.have.nested.property("config.requestFilter")
      })
    })
    describe("when no configuration is given", () => {
      it("does not set the configuration on the object", () => {
        v = new Verifier()
        expect(v).to.not.have.deep.property("config")
      })
    })
  })
  describe("#setConfig", () => {
    let spy: sinon.SinonSpy
    beforeEach(() => {
      spy = sinon.spy(serviceFactory, "logLevel")
      v = new Verifier(opts)
    })
    context("when logLevel is provided", () => {
      it("sets the log level on pact node", () => {
        v["setConfig"]({
          ...opts,
          logLevel: "debug",
        })
        expect(spy.callCount).to.eql(1)
      })
    })
    context("when logLevel is not provided", () => {
      it("does not modify the log setting", () => {
        v["setConfig"]({
          ...opts,
        })
        expect(spy.callCount).to.eql(0)
      })
    })
  })
  describe("#setupStates", () => {
    describe("when there are provider states on the pact", () => {
      describe("and there are handlers associated with those states", () => {
        it("executes the handler and returns a set of Promises", async () => {
          v = new Verifier(opts)
          const res = await v["setupStates"]({
            states: [state],
          })
          expect(res).lengthOf(1)
        })
      })
      describe("and there are no handlers associated with those states", () => {
        it("executes the handler and returns an empty Promise", async () => {
          const spy = sinon.spy(logger, "warn")
          delete opts.stateHandlers
          v = new Verifier(opts)
          const res = await v["setupStates"]({
            states: [state],
          })
          expect(res).lengthOf(0)
          expect(spy.callCount).to.eql(1)
        })
      })
    })
    describe("when there are no provider states on the pact", () => {
      it("executes the handler and returns an empty Promise", async () => {
        v = new Verifier(opts)
        const res = await v["setupStates"]({})
        expect(res).lengthOf(0)
      })
    })
  })
  describe("#verifyProvider", () => {
    // beforeEach(() => {
    //   v = new Verifier()
    // })
    it("creates a Provider when all mandatory parameters are provided", () => {})

    // describe("when the provider state has been given a handler", () => {
    //   it("executes the handler", async () => {
    //     const stub = sinon
    //       .stub()
    //       .returns({ promise: () => Promise.resolve({ foo: "bar" }) })
    //     sinon.stub(v, "setupProxyApplication" as any).returns({})
    //     sinon.stub(v, "setupProxyServer" as any).returns({ close: () => {} })
    //     sinon.stub(v, "waitForServerReady" as any).returns(Promise.resolve())
    //     sinon
    //       .stub(v, "runProviderVerification" as any)
    //       .returns(Promise.resolve("done"))
    //     await v.verifyProvider()
    //     expect(executed).to.eq(true)
    //   })
    // })
  })
  describe("#waitForServerReady", () => {
    it("creates a Provider when all mandatory parameters are provided", () => {})
  })
  describe("#runProviderVerification", () => {
    it("creates a Provider when all mandatory parameters are provided", () => {})
  })
  describe("#setupStateHandler", () => {
    it("creates a Provider when all mandatory parameters are provided", () => {})
  })
  describe("#setupProxyServer", () => {
    it("creates a Provider when all mandatory parameters are provided", () => {})
  })
  describe("#setupProxyApplicationn", () => {
    it("creates a Provider when all mandatory parameters are provided", () => {})
  })
})
