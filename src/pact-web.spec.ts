/* tslint:disable:no-unused-expression object-literal-sort-keys */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { HTTPMethod } from "./common/request";
import { Interaction, InteractionObject } from "./dsl/interaction";
import { MockService } from "./dsl/mockService";
import { PactOptions, PactOptionsComplete } from "./dsl/options";
import { PactWeb } from "./pact-web";

const expect = chai.expect;
const proxyquire = require("proxyquire").noCallThru();
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe("PactWeb", () => {
  const fullOpts = {
    consumer: "A",
    cors: false,
    host: "127.0.0.1",
    logLevel: "info",
    pactfileWriteMode: "overwrite",
    port: 1234,
    provider: "B",
    spec: 2,
    ssl: false,
  } as PactOptionsComplete;

  const sandbox = sinon.sandbox.create({
    injectInto: null,
    properties: ["spy", "stub", "mock"],
    useFakeServer: false,
    useFakeTimers: false,
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("#constructor", () => {
    const defaults = {
      consumer: "A",
      provider: "B",
    } as PactOptions;

    it("throws Error when consumer not provided", () => {
      expect(() => {
        new PactWeb({ consumer: "", provider: "provider" });
      }).not.to.throw(Error, "You must specify a Consumer for this pact.");
    });

    it("throws Error when provider not provided", () => {
      expect(() => {
        new PactWeb({ consumer: "someconsumer", provider: "" });
      }).not.to.throw(Error, "You must specify a Provider for this pact.");
    });
  });

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
    };

    describe("when given a provider state", () => {
      it("creates interaction with state", (done) => {
        const pact = Object.create(PactWeb.prototype) as any as PactWeb;
        pact.opts = fullOpts;
        pact.mockService = {
          addInteraction: (int: InteractionObject): Promise<string | undefined> => Promise.resolve(int.state),
        } as any as MockService;
        expect(pact.addInteraction(interaction)).to.eventually.have.property("providerState").notify(done);
      });
    });

    describe("when not given a provider state", () => {
      it("creates interaction with state", (done) => {
        const pact = Object.create(PactWeb.prototype) as any as PactWeb;
        pact.opts = fullOpts;
        pact.mockService = {
          addInteraction: (int: InteractionObject): Promise<string | undefined> => Promise.resolve(int.state),
        } as any as MockService;

        const interactionWithNoState = interaction;
        interactionWithNoState.state = undefined;
        expect(pact.addInteraction(interaction)).to.eventually.not.have.property("providerState").notify(done);
      });
    });
  });

  describe("#verify", () => {
    const Pact = PactWeb;

    describe("when pact verification is successful", () => {
      it("should return a successful promise and remove interactions", (done) => {
        const verifyStub = sandbox.stub(MockService.prototype, "verify");
        verifyStub.resolves("verified!");
        const removeInteractionsStub = sandbox.stub(MockService.prototype, "removeInteractions");
        removeInteractionsStub.resolves("removeInteractions");

        const b = Object.create(PactWeb.prototype) as any as PactWeb;
        b.opts = fullOpts;
        b.mockService = { verify: verifyStub, removeInteractions: removeInteractionsStub } as any as MockService;

        const verifyPromise = b.verify();
        expect(verifyPromise).to.eventually.eq("removeInteractions");
        expect(verifyPromise).to.eventually.be.fulfilled.notify(done);
      });
    });

    describe("when pact verification is unsuccessful", () => {
      it("should throw an error", (done) => {
        const verifyStub = sandbox.stub(MockService.prototype, "verify");
        verifyStub.rejects("not verified!");
        const removeInteractionsStub = sandbox.stub(MockService.prototype, "removeInteractions");
        removeInteractionsStub.resolves("removeInteractions");

        const b = Object.create(PactWeb.prototype) as any as PactWeb;
        b.opts = fullOpts;
        b.mockService = { verify: verifyStub, removeInteractions: removeInteractionsStub } as any as MockService;

        const verifyPromise = b.verify();
        expect(verifyPromise).to.eventually.be.rejectedWith(Error).notify(done);
        verifyPromise.catch((e) => {
          expect(removeInteractionsStub).to.callCount(0);
        });
      });
    });

    describe("when pact verification is successful", () => {
      describe("and an error is thrown in the cleanup", () => {
        it("should throw an error", (done) => {
          const verifyStub = sandbox.stub(MockService.prototype, "verify");
          verifyStub.resolves("verified!");
          const removeInteractionsStub = sandbox.stub(MockService.prototype, "removeInteractions");
          removeInteractionsStub.throws(new Error("error removing interactions"));

          const b = Object.create(PactWeb.prototype) as any as PactWeb;
          b.opts = fullOpts;
          b.mockService = { verify: verifyStub, removeInteractions: removeInteractionsStub } as any as MockService;

          expect(b.verify()).to.eventually.be.rejectedWith(Error).notify(done);
        });
      });
    });
  });

  describe("#finalize", () => {
    const Pact = PactWeb;

    describe("when writing Pact is successful", () => {
      it("should return a successful promise and shut down down the mock server", (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, "writePact").resolves("pact file written!");

        const p = Object.create(PactWeb.prototype) as any as PactWeb;
        p.opts = fullOpts;
        p.mockService = { writePact: writePactStub, removeInteractions: sandbox.stub() } as any as MockService;

        const writePactPromise = p.finalize();
        expect(writePactPromise).to.eventually.be.fulfilled.notify(done);
      });
    });

    describe("when writing Pact is unsuccessful", () => {
      it("should throw an error", (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, "writePact").rejects("pact not file written!");

        const p = Object.create(PactWeb.prototype) as any as PactWeb;
        p.opts = fullOpts;
        p.mockService = { writePact: writePactStub, removeInteractions: sandbox.stub() } as any as MockService;

        const writePactPromise = p.finalize();
        expect(writePactPromise).to.eventually.be.rejectedWith(Error).notify(done);
      });
    });
  });

  describe("#writePact", () => {
    const Pact = PactWeb;

    describe("when writing Pact is successful", () => {
      it("should return a successful promise", (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, "writePact").resolves("pact file written!");

        const p = Object.create(PactWeb.prototype) as any as PactWeb;
        p.opts = fullOpts;
        p.mockService = { writePact: writePactStub, removeInteractions: sandbox.stub() } as any as MockService;

        const writePactPromise = p.writePact();
        expect(writePactPromise).to.eventually.eq("pact file written!");
        expect(writePactPromise).to.eventually.be.fulfilled.notify(done);
      });
    });
  });

  describe("#removeInteractions", () => {
    const Pact = PactWeb;

    describe("when removing interactions is successful", () => {
      it("should return a successful promise", (done) => {
        const removeInteractionsStub = sandbox
          .stub(MockService.prototype, "removeInteractions")
          .resolves("interactions removed!");

        const p = Object.create(PactWeb.prototype) as any as PactWeb;
        p.opts = fullOpts;
        p.mockService = { removeInteractions: removeInteractionsStub } as any as MockService;

        const removeInteractionsPromise = p.removeInteractions();
        expect(removeInteractionsPromise).to.eventually.eq("interactions removed!");
        expect(removeInteractionsPromise).to.eventually.be.fulfilled.notify(done);
      });
    });
  });
});
