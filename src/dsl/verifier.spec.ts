/* tslint:disable:no-unused-expression no-empty no-string-literal*/
import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import * as sinon from "sinon"
import { Verifier, VerifierOptions } from "./verifier"
import serviceFactory from "@pact-foundation/pact-node"
import logger from "../common/logger"
import * as http from "http"
import * as express from "express"

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

  // Little function to mock out an Event Emitter
  const fakeServer = (event: string) => ({
    on: (registeredEvent: string, cb: any) => {
      if (registeredEvent === event) {
        cb()
      }
    },
  })

  beforeEach(() => {
    executed = false
    opts = {
      providerBaseUrl,
      requestFilter: (req, res, next) => {
        next()
      },
      stateHandlers: {
        [state]: () => {
          executed = true
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
          expect(executed).to.be.true
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
          expect(executed).to.be.false
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
    beforeEach(() => {
      v = new Verifier()
      sinon.stub(v, "startProxy" as any).returns({
        close: () => {
          executed = true
        },
      })
      sinon.stub(v, "waitForServerReady" as any).returns(Promise.resolve())
    })

    describe("when no configuration has been given", () => {
      it("fails with an error", () => {
        return expect(v.verifyProvider()).to.eventually.be.rejectedWith(Error)
      })
    })

    describe("when the verifier has been configured", () => {
      context("and the verification runs successfully", () => {
        it("closes the server and returns the result", () => {
          sinon
            .stub(v, "runProviderVerification" as any)
            .returns(Promise.resolve("done"))

          const res = v.verifyProvider(opts)

          return expect(res).to.eventually.be.fulfilled.then(() => {
            expect(executed).to.be.true
          })
        })
      })

      context("and the verification fails", () => {
        it("closes the server and returns the result", () => {
          sinon
            .stub(v, "runProviderVerification" as any)
            .returns(() => Promise.reject("error"))

          const res = v.verifyProvider(opts)

          return expect(res).to.eventually.be.rejected.then(() => {
            expect(executed).to.be.true
          })
        })
      })
    })
  })

  describe("#waitForServerReady", () => {
    beforeEach(() => {
      v = new Verifier()
    })

    context("when the server starts successfully", () => {
      it("returns a successful promise", () => {
        const res = v["waitForServerReady"](fakeServer(
          "listening"
        ) as http.Server)

        return expect(res).to.eventually.be.fulfilled
      })
    })

    context("when the server fails to start", () => {
      it("returns an error", () => {
        const res = v["waitForServerReady"](fakeServer("error") as http.Server)

        return expect(res).to.eventually.be.rejected
      })
    })
  })

  describe("#createProxyStateHandler", () => {
    v = new Verifier()
    let res: any
    const mockResponse = {
      sendStatus: (status: number) => {
        res = status
      },
      status: (status: number) => {
        res = status
        return {
          send: () => {},
        }
      },
    }

    context("when valid state handlers are provided", () => {
      it("returns a 200", () => {
        sinon.stub(v, "setupStates" as any).returns(Promise.resolve())
        const h = v["createProxyStateHandler"]()

        return expect(h({}, mockResponse)).to.eventually.be.fulfilled.then(
          () => {
            expect(res).to.eql(200)
          }
        )
      })
    })

    context("when there is a problem with a state handler", () => {
      it("returns a 500", () => {
        sinon
          .stub(v, "setupStates" as any)
          .returns(Promise.reject("state error"))

        const h = v["createProxyStateHandler"]()

        return expect(h({}, mockResponse)).to.eventually.be.fulfilled.then(
          () => {
            expect(res).to.eql(500)
          }
        )
      })
    })
  })

  describe("#startProxy", () => {
    v = new Verifier()

    it("starts a given http.Server", () => {
      v["startProxy"](express())
    })
  })
})
