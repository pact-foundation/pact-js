/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { Interaction, InteractionObject } from "./dsl/interaction";
import { MockService } from "./dsl/mockService";
import { PactOptions, PactOptionsComplete } from "./dsl/options";
import { Pact as PactType } from "./pact";

const expect = chai.expect;
const proxyquire = require("proxyquire").noCallThru();
chai.use(sinonChai);
chai.use(chaiAsPromised);

// Mock out the PactNode interfaces
class PactServer {
  public start(): void { }
  public delete(): void { }
}

class PactNodeFactory {
  public logLevel(opts: any): void { }
  public removeAllServers(): void { }
  public createServer(opts: any): any { }
}

class PactNodeMockService {
  public addInteraction(): Promise<any> {
    return Promise.resolve("addInteraction");
  }
}

describe("Pact", () => {
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
  } as PactOptionsComplete;
  let mockServiceStub: sinon.SinonStub;

  const sandbox = sinon.sandbox.create({
    injectInto: null,
    properties: ["spy", "stub", "mock"],
    useFakeTimers: false,
    useFakeServer: false,
  });

  beforeEach(() => {
    mockServiceStub = sandbox.stub(new PactNodeMockService());
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("#constructor", () => {
    let Pact: any;

    beforeEach(() => {
      const imported = proxyquire("./pact", {
        "@pact-foundation/pact-node": sinon.createStubInstance(PactNodeFactory),
      });
      Pact = imported.Pact;
    });

    it("throws Error when consumer not provided", () => {
      expect(() => { new Pact({ consumer: "", provider: "provider" }); }).
        to.throw(Error, "You must specify a Consumer for this pact.");
    });

    it("throws Error when provider not provided", () => {
      expect(() => { new Pact({ consumer: "someconsumer", provider: "" }); }).
        to.throw(Error, "You must specify a Provider for this pact.");
    });
  });

  describe("#createOptionsWithDefault", () => {
    const constructorOpts: PactOptions = {
      consumer: "A",
      provider: "B",
    };

    it("should merge options with sensible defaults", () => {
      const opts = PactType.createOptionsWithDefaults(constructorOpts);
      expect(opts.consumer).to.eq("A");
      expect(opts.provider).to.eq("B");
      expect(opts.cors).to.eq(false);
      expect(opts.host).to.eq("127.0.0.1");
      expect(opts.logLevel).to.eq("info");
      expect(opts.spec).to.eq(2);
      expect(opts.dir).not.to.be.empty;
      expect(opts.log).not.to.be.empty;
      expect(opts.pactfileWriteMode).to.eq("overwrite");
      expect(opts.ssl).to.eq(false);
      expect(opts.sslcert).to.eq(undefined);
      expect(opts.sslkey).to.eq(undefined);
    });
  });

  describe("#setup", () => {
    const Pact = PactType;

    describe("when server is not properly configured", () => {
      describe("and pact-node is unable to start the server", () => {
        it("should return a rejected promise", (done) => {
          const startStub = sandbox.stub(PactServer.prototype, "start").throws("start");
          const b = Object.create(Pact.prototype) as any as PactType;
          b.opts = fullOpts;
          b.server = { start: startStub };
          expect(b.setup()).to.eventually.be.rejected.notify(done);
        });
      });
    });
    describe("when server is properly configured", () => {
      it("should start the mock server in the background", (done) => {
        const startStub = sandbox.stub(PactServer.prototype, "start");
        const b = Object.create(Pact.prototype) as any as PactType;
        b.opts = fullOpts;
        b.server = { start: startStub };
        expect(b.setup()).to.eventually.be.fulfilled.notify(done);
      });
    });
  });

  describe("#addInteraction", () => {
    const Pact = PactType;
    const interaction: InteractionObject = {
      state: "i have a list of projects",
      uponReceiving: "a request for projects",
      withRequest: {
        method: "GET",
        path: "/projects",
        headers: { Accept: "application/json" },
      },
      willRespondWith: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {},
      },
    };

    describe("when given a provider state", () => {
      it("creates interaction with state", (done) => {
        const pact = Object.create(Pact.prototype) as any as PactType;
        pact.opts = fullOpts;
        pact.mockService = {
          addInteraction: (int: InteractionObject): Promise<string | undefined> => Promise.resolve(int.state),
        } as any as MockService;
        expect(pact.addInteraction(interaction)).to.eventually.have.property("providerState").notify(done);
      });
    });

    describe("when not given a provider state", () => {
      it("creates interaction with no state", (done) => {
        const pact = Object.create(Pact.prototype) as any as PactType;
        pact.opts = fullOpts;
        pact.mockService = {
          addInteraction: (int: InteractionObject): Promise<string | undefined> => Promise.resolve(int.state),
        } as any as MockService;

        const interactionWithNoState = interaction;
        interactionWithNoState.state = undefined;
        expect(pact.addInteraction(interaction)).to.eventually.not.have.property("providerState").notify(done);
      });

      describe("when given an Interaction as a builder", () => {
        it("creates interaction", (done) => {
          const interaction2 = new Interaction()
            .given("i have a list of projects")
            .uponReceiving("a request for projects")
            .withRequest({
              method: "GET",
              path: "/projects",
              headers: { Accept: "application/json" },
            })
            .willRespondWith({
              status: 200,
              headers: { "Content-Type": "application/json" },
              body: {},
            });

          const pact = Object.create(Pact.prototype) as any as PactType;
          pact.opts = fullOpts;
          pact.mockService = {
            addInteraction: (int: Interaction): Promise<Interaction> => Promise.resolve(int),
          } as any as MockService;
          expect(pact.addInteraction(interaction2)).to.eventually.have.property("given").notify(done);
        });
      });
    });
  });

  describe("#verify", () => {
    const Pact = PactType;

    describe("when pact verification is successful", () => {
      it("should return a successful promise and remove interactions", (done) => {
        const verifyStub = sandbox.stub(MockService.prototype, "verify");
        verifyStub.resolves("verified!");
        const removeInteractionsStub = sandbox.stub(MockService.prototype, "removeInteractions");
        removeInteractionsStub.resolves("removeInteractions");

        const b = Object.create(Pact.prototype) as any as PactType;
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

        const b = Object.create(Pact.prototype) as any as PactType;
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

          const b = Object.create(Pact.prototype) as any as PactType;
          b.opts = fullOpts;
          b.mockService = { verify: verifyStub, removeInteractions: removeInteractionsStub } as any as MockService;

          expect(b.verify()).to.eventually.be.rejectedWith(Error).notify(done);
        });
      });
    });
  });

  describe("#finalize", () => {
    const Pact = PactType;

    describe("when writing Pact is successful", () => {
      it("should return a successful promise and shut down down the mock server", (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, "writePact").resolves("pact file written!");

        const p = Object.create(Pact.prototype) as any as PactType;
        p.opts = fullOpts;
        p.mockService = { writePact: writePactStub, removeInteractions: sandbox.stub() } as any as MockService;
        p.server = { delete: sandbox.stub(PactServer.prototype, "delete").resolves("server deleted!") };

        const writePactPromise = p.finalize();
        expect(writePactPromise).to.eventually.eq("server deleted!");
        expect(writePactPromise).to.eventually.be.fulfilled.notify(done);
      });
    });

    describe("when writing Pact is unsuccessful", () => {
      it("should throw an error and shut down the server", (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, "writePact").rejects("pact not file written!");
        const deleteStub = sandbox.stub(PactServer.prototype, "delete").resolves("server deleted!");

        const p = Object.create(Pact.prototype) as any as PactType;
        p.opts = fullOpts;
        p.mockService = { writePact: writePactStub, removeInteractions: sandbox.stub() } as any as MockService;
        p.server = { delete: deleteStub };

        const writePactPromise = p.finalize();
        expect(writePactPromise).to.eventually.be.rejectedWith(Error).notify(done);
        writePactPromise.catch((e) => {
          expect(deleteStub).to.callCount(1);
        });
      });
    });

    describe("when writing pact is successful and shutting down the mock server is unsuccessful", () => {
      it("should throw an error", (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, "writePact").resolves("pact file written!");

        const p = Object.create(Pact.prototype) as any as PactType;
        p.opts = fullOpts;
        p.mockService = { writePact: writePactStub, removeInteractions: sandbox.stub() } as any as MockService;
        p.server = { delete: sandbox.stub(PactServer.prototype, "delete").rejects("server not deleted!") };

        const writePactPromise = p.finalize();
        expect(writePactPromise).to.eventually.be.rejectedWith(Error, "server not deleted!").notify(done);
      });
    });
  });

  describe("#writePact", () => {
    const Pact = PactType;

    describe("when writing Pact is successful", () => {
      it("should return a successful promise", (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, "writePact").resolves("pact file written!");

        const p = Object.create(Pact.prototype) as any as PactType;
        p.opts = fullOpts;
        p.mockService = { writePact: writePactStub, removeInteractions: sandbox.stub() } as any as MockService;

        const writePactPromise = p.writePact();
        expect(writePactPromise).to.eventually.eq("pact file written!");
        expect(writePactPromise).to.eventually.be.fulfilled.notify(done);
      });
    });
  });

  describe("#removeInteractions", () => {
    const Pact = PactType;

    describe("when removing interactions is successful", () => {
      it("should return a successful promise", (done) => {
        const removeInteractionsStub = sandbox
          .stub(MockService.prototype, "removeInteractions")
          .resolves("interactions removed!");

        const p = Object.create(Pact.prototype) as any as PactType;
        p.opts = fullOpts;
        p.mockService = { removeInteractions: removeInteractionsStub } as any as MockService;

        const removeInteractionsPromise = p.removeInteractions();
        expect(removeInteractionsPromise).to.eventually.eq("interactions removed!");
        expect(removeInteractionsPromise).to.eventually.be.fulfilled.notify(done);
      });
    });
  });
});
