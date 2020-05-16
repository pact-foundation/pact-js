/* tslint:disable:no-unused-expression object-literal-sort-keys */
import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import * as sinon from "sinon"
import * as sinonChai from "sinon-chai"
import { HTTPMethod } from "./common/request"
import { Interaction, InteractionObject } from "./dsl/interaction"
import { MockService } from "./dsl/mockService"
import { PactOptionsComplete } from "./dsl/options"
import { PactWeb } from "./pact-web"

const expect = chai.expect
chai.use(sinonChai)
chai.use(chaiAsPromised)

describe("PactWeb", () => {
  let pact: PactWeb
  const fullOpts = {
    cors: false,
    host: "127.0.0.1",
    logLevel: "info",
    pactfileWriteMode: "overwrite",
    port: 1234,
    spec: 2,
    ssl: false,
  } as PactOptionsComplete

  beforeEach(() => {
    pact = (Object.create(PactWeb.prototype) as any) as PactWeb
    pact.opts = fullOpts
  })

  afterEach(() => {
    sinon.restore()
  })

  describe("#addInteraction", () => {
    const interaction: InteractionObject = {
      state: "i have a list of projects",
      uponReceiving: "a request for projects",
      withRequest: {
        headers: { Accept: "application/json" },
        method: HTTPMethod.GET,
        path: "/projects",
      },
      willRespondWith: {
        body: {},
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    }

    describe("when given a provider state", () => {
      it("creates interaction with state", done => {
        pact.mockService = {
          addInteraction: (
            int: InteractionObject
          ): Promise<string | undefined> => Promise.resolve(int.state),
        } as any

        expect(pact.addInteraction(interaction))
          .to.eventually.have.property("providerState")
          .notify(done)
      })
    })

    describe("when not given a provider state", () => {
      it("creates interaction with state", done => {
        pact.mockService = {
          addInteraction: (
            int: InteractionObject
          ): Promise<string | undefined> => Promise.resolve(int.state),
        } as any

        const interactionWithNoState = interaction
        interactionWithNoState.state = undefined

        expect(pact.addInteraction(interaction))
          .to.eventually.not.have.property("providerState")
          .notify(done)
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
        pact.mockService = {
          verify: () => Promise.resolve("verified!"),
          removeInteractions: () => Promise.resolve("removeInteractions"),
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
        const removeInteractionsStub = sinon
          .stub(MockService.prototype, "removeInteractions")
          .resolves("removeInteractions")

        pact.mockService = {
          verify: () => Promise.reject("not verified!"),
          removeInteractions: () => removeInteractionsStub,
        } as any

        const verifyPromise = pact.verify()

        return Promise.all([
          expect(verifyPromise).to.eventually.be.rejectedWith(Error),
          verifyPromise.catch(e => {
            expect(removeInteractionsStub).to.callCount(0)
          }),
        ])
      })
    })

    describe("when pact verification is successful", () => {
      describe("and an error is thrown in the cleanup", () => {
        it("throws an error", () => {
          pact.mockService = {
            verify: () => Promise.resolve("verified!"),
            removeInteractions: () => {
              throw new Error("error removing interactions")
            },
          } as any

          return expect(pact.verify()).to.eventually.be.rejectedWith(Error)
        })
      })
    })
  })

  describe("#finalize", () => {
    describe("when writing Pact is successful", () => {
      it("returns a successful promise and shut down down the mock server", () => {
        pact.mockService = {
          writePact: () => Promise.resolve("pact file written!"),
          removeInteractions: sinon.stub(),
        } as any

        const writePactPromise = pact.finalize()

        return expect(writePactPromise).to.eventually.be.fulfilled
      })
    })

    describe("when writing Pact is unsuccessful", () => {
      it("throws an error", () => {
        pact.mockService = {
          writePact: () => Promise.reject(new Error("pact not file written!")),
          removeInteractions: sinon.stub(),
        } as any

        return expect(pact.finalize()).to.eventually.be.rejectedWith(Error)
      })
    })
  })

  describe("#writePact", () => {
    describe("when writing Pact is successful", () => {
      it("returns a successful promise", () => {
        pact.mockService = {
          writePact: () => Promise.resolve("pact file written!"),
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
        pact.mockService = {
          removeInteractions: () => Promise.resolve("interactions removed!"),
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
