'use strict'
import { Interaction, InteractionObject } from './dsl/interaction';
import { MockService } from './dsl/mockService';
import { Pact as PactType, PactOptions, PactOptionsComplete } from './pact';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

const expect = chai.expect;
const proxyquire = require('proxyquire').noCallThru();
chai.use(sinonChai)
chai.use(chaiAsPromised)

// Mock out the PactNode interfaces
// TODO: move into a test helper or type def?
class PactServer {
  start(): void { };
  delete(): void { };
}

class PactNodeFactory {
  logLevel(opts: any): void { };
  removeAllServers(): void { };
  createServer(opts: any): any { };
}

class PactNodeMockService {
  addInteraction(): Promise<any> {
    return Promise.resolve('addInteraction');
  };
}

describe('Pact', () => {
  const fullOpts = {
    consumer: 'A',
    provider: 'B',
    port: 1234,
    host: '127.0.0.1',
    ssl: false,
    logLevel: 'INFO',
    spec: 2,
    cors: false,
    pactfileWriteMode: 'overwrite'
  } as PactOptionsComplete;
  let mockServiceStub: sinon.SinonStub;

  const sandbox = sinon.sandbox.create({
    injectInto: null,
    properties: ['spy', 'stub', 'mock'],
    useFakeTimers: false,
    useFakeServer: false
  });

  beforeEach(() => {
    mockServiceStub = sandbox.stub(new PactNodeMockService());
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#constructor', () => {
    let Pact: any;
    let pact: PactType;

    beforeEach(() => {
      const imported = proxyquire('./pact', {
        '@pact-foundation/pact-node': sinon.createStubInstance(PactNodeFactory)
      });
      Pact = imported.Pact;
    });
    const defaults = {
      consumer: 'A',
      provider: 'B'
    } as PactOptions;

    it('throws Error when consumer not provided', () => {
      expect(() => { new Pact({ 'consumer': '', 'provider': 'provider' }) }).
        to.throw(Error, 'You must specify a Consumer for this pact.');
    });

    it('throws Error when provider not provided', () => {
      expect(() => { new Pact({ 'consumer': 'someconsumer', 'provider': '' }) }).
        to.throw(Error, 'You must specify a Provider for this pact.');
    });

    it('returns object with three functions to be invoked', () => {
      pact = new Pact(defaults);
      expect(pact).to.have.property('addInteraction');
      expect(pact).to.have.property('verify');
      expect(pact).to.have.property('finalize');
      expect(pact).to.have.property('mockService');
      expect(pact.mockService).to.be.an.instanceOf(MockService);
    });

    it('should merge options with sensible defaults', () => {
      pact = new Pact(defaults);
      expect(pact.opts.consumer).to.eq('A');
      expect(pact.opts.provider).to.eq('B');
      expect(pact.opts.cors).to.eq(false);
      expect(pact.opts.host).to.eq('127.0.0.1');
      expect(pact.opts.logLevel).to.eq('INFO');
      expect(pact.opts.spec).to.eq(2);
      expect(pact.opts.dir).not.to.be.empty;
      expect(pact.opts.log).not.to.be.empty;
      expect(pact.opts.pactfileWriteMode).to.eq('overwrite');
      expect(pact.opts.ssl).to.eq(false);
      expect(pact.opts.sslcert).to.eq(undefined);
      expect(pact.opts.sslkey).to.eq(undefined);
    })
  });

  describe('#setup', () => {
    const Pact = PactType;

    describe('when server is not properly configured', () => {
      describe('and pact-node is unable to start the server', () => {
        it('should return a rejected promise', (done) => {
          const startStub = sandbox.stub(PactServer.prototype, 'start').throws('start');
          const b = <PactType><any>Object.create(Pact.prototype);
          b.opts = fullOpts;
          b.server = { start: startStub };
          expect(b.setup()).to.eventually.be.rejected.notify(done);
        });
      });
    });
    describe('when server is properly configured', () => {
      it('should start the mock server in the background', (done) => {
        const startStub = sandbox.stub(PactServer.prototype, 'start');
        const b = <PactType><any>Object.create(Pact.prototype);
        b.opts = fullOpts;
        b.server = { start: startStub };
        expect(b.setup()).to.eventually.be.fulfilled.notify(done);
      });
    });
  });

  describe('#addInteraction', () => {
    const Pact = PactType;
    const interaction: InteractionObject = {
      state: 'i have a list of projects',
      uponReceiving: 'a request for projects',
      withRequest: {
        method: 'GET',
        path: '/projects',
        headers: { 'Accept': 'application/json' }
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {}
      }
    };

    describe('when given a provider state', () => {
      it('creates interaction with state', (done) => {
        const pact = <PactType><any>Object.create(Pact.prototype);
        pact.opts = fullOpts;
        pact.mockService = <MockService><any>{
          addInteraction: (int: InteractionObject): Promise<string | undefined> => Promise.resolve(int.state)
        };
        expect(pact.addInteraction(interaction)).to.eventually.have.property('providerState').notify(done)
      });
    });

    describe('when not given a provider state', () => {
      it('creates interaction with state', (done) => {
        const pact = <PactType><any>Object.create(Pact.prototype);
        pact.opts = fullOpts;
        pact.mockService = <MockService><any>{
          addInteraction: (int: InteractionObject): Promise<string | undefined> => Promise.resolve(int.state)
        };

        const interactionWithNoState = interaction;
        interactionWithNoState.state = undefined;
        expect(pact.addInteraction(interaction)).to.eventually.not.have.property('providerState').notify(done)
      });
    });
  });

  describe('#verify', () => {
    const Pact = PactType;

    describe('when pact verification is successful', () => {
      it('should return a successful promise and remove interactions', (done) => {
        const verifyStub = sandbox.stub(MockService.prototype, 'verify');
        verifyStub.resolves('verified!');
        const removeInteractionsStub = sandbox.stub(MockService.prototype, 'removeInteractions');
        removeInteractionsStub.resolves('removeInteractions');

        const b = <PactType><any>Object.create(Pact.prototype);
        b.opts = fullOpts;
        b.mockService = <MockService><any>{ verify: verifyStub, removeInteractions: removeInteractionsStub };

        const verifyPromise = b.verify();
        expect(verifyPromise).to.eventually.eq('removeInteractions');
        expect(verifyPromise).to.eventually.be.fulfilled.notify(done);
      });
    });

    describe('when pact verification is unsuccessful', () => {
      it('should throw an error', (done) => {
        const verifyStub = sandbox.stub(MockService.prototype, 'verify');
        verifyStub.rejects('not verified!');
        const removeInteractionsStub = sandbox.stub(MockService.prototype, 'removeInteractions');
        removeInteractionsStub.resolves('removeInteractions');

        const b = <PactType><any>Object.create(Pact.prototype);
        b.opts = fullOpts;
        b.mockService = <MockService><any>{ verify: verifyStub, removeInteractions: removeInteractionsStub };

        const verifyPromise = b.verify();
        expect(verifyPromise).to.eventually.be.rejectedWith(Error).notify(done)
        verifyPromise.catch((e) => {
          expect(removeInteractionsStub).to.callCount(0);
        });
      });
    });

    describe('when pact verification is successful', () => {
      describe('and an error is thrown in the cleanup', () => {
        it('should throw an error', (done) => {
          const verifyStub = sandbox.stub(MockService.prototype, 'verify');
          verifyStub.resolves('verified!');
          const removeInteractionsStub = sandbox.stub(MockService.prototype, 'removeInteractions');
          removeInteractionsStub.throws(new Error('error removing interactions'));

          const b = <PactType><any>Object.create(Pact.prototype);
          b.opts = fullOpts;
          b.mockService = <MockService><any>{ verify: verifyStub, removeInteractions: removeInteractionsStub };

          expect(b.verify()).to.eventually.be.rejectedWith(Error).notify(done)
        });
      });
    });
  });

  describe('#finalize', () => {
    const Pact = PactType;

    describe('when writing Pact is successful', () => {
      it('should return a successful promise and shut down down the mock server', (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, 'writePact').resolves('pact file written!');

        const p = <PactType><any>Object.create(Pact.prototype);
        p.opts = fullOpts;
        p.mockService = <MockService><any>{ writePact: writePactStub, removeInteractions: sandbox.stub() };
        p.server = { delete: sandbox.stub(PactServer.prototype, 'delete').resolves('server deleted!') };

        const writePactPromise = p.finalize();
        expect(writePactPromise).to.eventually.eq('server deleted!');
        expect(writePactPromise).to.eventually.be.fulfilled.notify(done);
      });
    });

    describe('when writing Pact is unsuccessful', () => {
      it('should throw an error and shut down the server', (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, 'writePact').rejects('pact not file written!');
        const deleteStub = sandbox.stub(PactServer.prototype, 'delete').resolves('server deleted!')

        const p = <PactType><any>Object.create(Pact.prototype);
        p.opts = fullOpts;
        p.mockService = <MockService><any>{ writePact: writePactStub, removeInteractions: sandbox.stub() };
        p.server = { delete: deleteStub };

        const writePactPromise = p.finalize();
        expect(writePactPromise).to.eventually.be.rejectedWith(Error).notify(done);
        writePactPromise.catch((e) => {
          expect(deleteStub).to.callCount(1);
        });
      });
    });

    describe('when writing pact is successful and shutting down the mock server is unsuccessful', () => {
      it('should throw an error', (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, 'writePact').resolves('pact file written!');

        const p = <PactType><any>Object.create(Pact.prototype);
        p.opts = fullOpts;
        p.mockService = <MockService><any>{ writePact: writePactStub, removeInteractions: sandbox.stub() };
        p.server = { delete: sandbox.stub(PactServer.prototype, 'delete').rejects('server not deleted!') };

        const writePactPromise = p.finalize();
        expect(writePactPromise).to.eventually.be.rejectedWith(Error, 'server not deleted!').notify(done);
      });
    });
  });

  describe('#writePact', () => {
    const Pact = PactType;

    describe('when writing Pact is successful', () => {
      it('should return a successful promise', (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, 'writePact').resolves('pact file written!');

        const p = <PactType><any>Object.create(Pact.prototype);
        p.opts = fullOpts;
        p.mockService = <MockService><any>{ writePact: writePactStub, removeInteractions: sandbox.stub() };

        const writePactPromise = p.writePact();
        expect(writePactPromise).to.eventually.eq('pact file written!');
        expect(writePactPromise).to.eventually.be.fulfilled.notify(done);
      });
    });
  });

  describe('#removeInteractions', () => {
    const Pact = PactType;

    describe('when writing Pact is successful', () => {
      it('should return a successful promise', (done) => {
        const removeInteractionsStub = sandbox.stub(MockService.prototype, 'removeInteractions').resolves('interactions removed!');

        const p = <PactType><any>Object.create(Pact.prototype);
        p.opts = fullOpts;
        p.mockService = <MockService><any>{ removeInteractions: removeInteractionsStub };

        const removeInteractionsPromise = p.removeInteractions();
        expect(removeInteractionsPromise).to.eventually.eq('interactions removed!');
        expect(removeInteractionsPromise).to.eventually.be.fulfilled.notify(done);
      });
    });
  });
});
