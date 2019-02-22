/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty no-console no-string-literal*/
import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import * as sinon from "sinon"
import * as sinonChai from "sinon-chai"
import { HTTPMethod } from "./common/request"
import { Interaction, InteractionObject } from "./dsl/interaction"
import { MockService } from "./dsl/mockService"
import { PactOptions, PactOptionsComplete } from "./dsl/options"
import serviceFactory from "@pact-foundation/pact-node"
import { Pact } from "./httpPact"
import { ImportMock } from "ts-mock-imports"

// Mock out the PactNode interfaces
class PactServer {
  public start(): void {}

  public delete(): void {}
}

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect
const makePact = () => (Object.create(Pact.prototype) as any) as Pact

describe("Pact", () => {
  let pact: Pact
  const fullOpts = {
    consumer: "A",
    provider: "B",
    port: 1234,
    host: "127.0.0.1",
    ssl: false,
    logLevel: "info",
    spec: 2,
    cors: false,
    pactfileWriteMode: "overwrite",
  } as PactOptionsComplete

  before(() => {
    // Stub out pact-node
    const manager = ImportMock.mockClass(serviceFactory, "createServer") as any
    manager.mock("createServer", () => {})
  })

  beforeEach(() => {
    pact = makePact()
  })

  afterEach(() => {
    sinon.restore()
    // return serviceFactory.removeAllServers()
  })

  describe("#constructor", () => {
    it("throws Error when consumer not provided", () => {
      expect(() => {
        new Pact({ consumer: "", provider: "provider" })
      }).to.throw(Error, "You must specify a Consumer for this pact.")
    })

    it("throws Error when provider not provided", () => {
      expect(() => {
        new Pact({ consumer: "someconsumer", provider: "" })
      }).to.throw(Error, "You must specify a Provider for this pact.")
    })
  })

  describe("#createOptionsWithDefault", () => {
    const constructorOpts: PactOptions = {
      consumer: "A",
      provider: "B",
    }

    it("merges options with sensible defaults", () => {
      const opts = Pact.createOptionsWithDefaults(constructorOpts)
      expect(opts.consumer).to.eq("A")
      expect(opts.provider).to.eq("B")
      expect(opts.cors).to.eq(false)
      expect(opts.host).to.eq("127.0.0.1")
      expect(opts.logLevel).to.eq("info")
      expect(opts.spec).to.eq(2)
      expect(opts.dir).not.to.be.empty
      expect(opts.log).not.to.be.empty
      expect(opts.pactfileWriteMode).to.eq("overwrite")
      expect(opts.ssl).to.eq(false)
      expect(opts.sslcert).to.eq(undefined)
      expect(opts.sslkey).to.eq(undefined)
    })
  })

  describe("#setup", () => {
    const serverMock = {
      start: () => Promise.resolve(),
      options: { port: 1234 },
      logLevel: (a: any) => {},
    }

    describe("when server is not properly configured", () => {
      describe("and pact-node is unable to start the server", () => {
        it("returns a rejected promise", async () => {
          const p: any = new Pact(fullOpts)

          p.server = {
            start: () => Promise.reject("pact-node error"),
            options: { port: 1234 },
          }

          return expect(p.setup()).to.eventually.be.rejectedWith(
            "pact-node error"
          )
        })
      })
    })
    describe("when server is properly configured", () => {
      it("starts the mock server in the background", () => {
        const p: any = new Pact(fullOpts)

        p.server = serverMock

        return expect(p.setup()).to.eventually.be.fulfilled
      })
    })
    describe("when server is properly configured", () => {
      it("returns the current configuration", () => {
        const p: any = new Pact(fullOpts)

        p.server = serverMock

        return expect(p.setup()).to.eventually.include({
          consumer: "A",
          provider: "B",
          port: 1234,
          host: "127.0.0.1",
          ssl: false,
          logLevel: "info",
          spec: 2,
          cors: false,
          pactfileWriteMode: "overwrite",
        })
      })
    })
  })

  describe("#addInteraction", () => {
    const interaction: InteractionObject = {
      state: "i have a list of projects",
      uponReceiving: "a request for projects",
      withRequest: {
        method: HTTPMethod.GET,
        path: "/projects",
        headers: { Accept: "application/json" },
      },
      willRespondWith: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {},
      },
    }

    describe("when given a provider state", () => {
      it("creates interaction with state", () => {
        pact.opts = fullOpts
        pact.mockService = {
          addInteraction: (
            int: InteractionObject
          ): Promise<string | undefined> => Promise.resolve(int.state),
        } as any

        return expect(
          pact.addInteraction(interaction)
        ).to.eventually.have.property("providerState")
      })
    })

    describe("when not given a provider state", () => {
      it("creates interaction with no state", () => {
        pact.opts = fullOpts
        pact.mockService = {
          addInteraction: (
            int: InteractionObject
          ): Promise<string | undefined> => Promise.resolve(int.state),
        } as any
        interaction.state = undefined

        return expect(
          pact.addInteraction(interaction)
        ).to.eventually.not.have.property("providerState")
      })

      describe("when given an Interaction as a builder", () => {
        it("creates interaction", () => {
          const interaction2 = new Interaction()
            .given("i have a list of projects")
            .uponReceiving("a request for projects")
            .withRequest({
              method: HTTPMethod.GET,
              path: "/projects",
              headers: { Accept: "application/json" },
            })
            .willRespondWith({
              status: 200,
              headers: { "Content-Type": "application/json" },
              body: {},
            })

          pact.opts = fullOpts
          pact.mockService = {
            addInteraction: (int: Interaction): Promise<Interaction> =>
              Promise.resolve(int),
          } as any

          return expect(
            pact.addInteraction(interaction2)
          ).to.eventually.have.property("given")
        })
      })
    })
  })

  describe("#verify", () => {
    describe("when pact verification is successful", () => {
      it("returns a successful promise and remove interactions", () => {
        const verifyStub = sinon
          .stub(MockService.prototype, "verify")
          .resolves("verified!")
        const removeInteractionsStub = sinon
          .stub(MockService.prototype, "removeInteractions")
          .resolves("removeInteractions")

        pact.opts = fullOpts
        pact.mockService = {
          verify: verifyStub,
          removeInteractions: removeInteractionsStub,
        } as any

        const verifyPromise = pact.verify()

        return Promise.all([
          expect(verifyPromise).to.eventually.eq("removeInteractions"),
          expect(verifyPromise).to.eventually.be.fulfilled,
        ])
      })
    })

    describe("when pact verification is unsuccessful", () => {
      it("throws an error", () => {
        const verifyStub = sinon
          .stub(MockService.prototype, "verify")
          .rejects("not verified!")
        const removeInteractionsStub = sinon
          .stub(MockService.prototype, "removeInteractions")
          .resolves("removeInteractions")

        pact.opts = fullOpts
        pact.mockService = {
          verify: verifyStub,
          removeInteractions: removeInteractionsStub,
        } as any

        const verifyPromise = pact.verify()

        return Promise.all([
          expect(verifyPromise).to.eventually.be.rejectedWith(Error),
          verifyPromise.catch(() =>
            expect(removeInteractionsStub).to.callCount(1)
          ),
        ])
      })
    })

    describe("when pact verification is successful", () => {
      describe("and an error is thrown in the cleanup", () => {
        it("throws an error", () => {
          const verifyStub = sinon
            .stub(MockService.prototype, "verify")
            .resolves("verified!")
          const removeInteractionsStub = sinon.stub(
            MockService.prototype,
            "removeInteractions"
          )
          removeInteractionsStub.throws(
            new Error("error removing interactions")
          )

          pact.opts = fullOpts
          pact.mockService = {
            verify: verifyStub,
            removeInteractions: removeInteractionsStub,
          } as any

          return expect(pact.verify()).to.eventually.be.rejectedWith(Error)
        })
      })
    })
  })

  describe("#finalize", () => {
    describe("when writing Pact is successful", () => {
      it("returns a successful promise and shut down down the mock server", () => {
        const writePactStub = sinon
          .stub(MockService.prototype, "writePact")
          .resolves()

        pact.opts = fullOpts
        pact.mockService = {
          writePact: writePactStub,
          removeInteractions: sinon.stub(),
        } as any
        pact.server = {
          delete: sinon.stub(PactServer.prototype, "delete").resolves(),
        } as any

        return expect(pact.finalize()).to.eventually.be.fulfilled
      })
    })

    describe("when writing Pact is unsuccessful", () => {
      it("throws an error and shut down the server", () => {
        const writePactStub = sinon
          .stub(MockService.prototype, "writePact")
          .rejects()
        const deleteStub = sinon.stub(PactServer.prototype, "delete").resolves()

        pact.opts = fullOpts
        pact.mockService = {
          writePact: writePactStub,
          removeInteractions: sinon.stub(),
        } as any
        pact.server = { delete: deleteStub } as any

        return expect(pact.finalize()).to.eventually.be.rejected.then(() =>
          expect(deleteStub).to.callCount(1)
        )
      })
    })

    describe("when writing pact is successful and shutting down the mock server is unsuccessful", () => {
      it("throws an error", () => {
        const writePactStub = sinon
          .stub(MockService.prototype, "writePact")
          .resolves()

        pact.opts = fullOpts
        pact.mockService = {
          writePact: writePactStub,
          removeInteractions: sinon.stub(),
        } as any
        pact.server = {
          delete: sinon.stub(PactServer.prototype, "delete").rejects(),
        } as any

        return expect(pact.finalize).to.throw(Error)
      })
    })
  })

  describe("#writePact", () => {
    describe("when writing Pact is successful", () => {
      it("returns a successful promise", () => {
        const writePactStub = sinon
          .stub(MockService.prototype, "writePact")
          .resolves("pact file written!")

        pact.opts = fullOpts
        pact.mockService = {
          writePact: writePactStub,
          removeInteractions: sinon.stub(),
        } as any

        const writePactPromise = pact.writePact()

        return Promise.all([
          expect(writePactPromise).to.eventually.eq("pact file written!"),
          expect(writePactPromise).to.eventually.be.fulfilled,
        ])
      })
    })
  })

  describe("#removeInteractions", () => {
    describe("when removing interactions is successful", () => {
      it("returns a successful promise", () => {
        const removeInteractionsStub = sinon
          .stub(MockService.prototype, "removeInteractions")
          .resolves("interactions removed!")

        pact.opts = fullOpts
        pact.mockService = {
          removeInteractions: removeInteractionsStub,
        } as any

        const removeInteractionsPromise = pact.removeInteractions()

        return Promise.all([
          expect(removeInteractionsPromise).to.eventually.eq(
            "interactions removed!"
          ),
          expect(removeInteractionsPromise).to.eventually.be.fulfilled,
        ])
      })
    })
  })
})
