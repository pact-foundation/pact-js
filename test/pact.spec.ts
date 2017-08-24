'use strict'
import { Interaction } from '../src/dsl/interaction';
import { MockService } from '../src/dsl/mockService';
import { Pact as PactType, PactOptions, PactOptionsComplete } from '../src/pact';
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
    console.log("aoeuaoeuaoeu");
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

  let sandbox = sinon.sandbox.create({
    injectInto: null,
    properties: ["spy", "stub", "mock"],
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
      const imported = proxyquire('../src/pact', {
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
      describe('pact is unable to start the server', () => {
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
        const b = <PactType><any>Object.create(Pact.prototype);
        b.opts = fullOpts;
        b.server = sinon.createStubInstance(PactServer);
        expect(b.setup()).to.eventually.be.fulfilled.notify(done);
      });
    });
  });
  describe('#addInteraction', () => {
    const Pact = PactType;

    it.only('creates interaction with state', (done) => {
      const pact = <PactType><any>Object.create(Pact.prototype);
      pact.opts = fullOpts;
      const addInteractionStub = sinon.stub();
      pact.mockService = <MockService><any>{
        addInteraction: (int: Interaction): Promise<any> => Promise.resolve(int.json())
      };
      let addInteractionPromise = pact.addInteraction({
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
      });

      expect(addInteractionPromise).to.eventually.have.property('providerState').notify(done)
    })

    //   it('creates interaction without state', (done) => {
    //     let addInteractionPromise = pact.addInteraction({
    //       uponReceiving: 'a request for projects',
    //       withRequest: {
    //         method: 'get',
    //         path: '/projects',
    //         headers: { 'Accept': 'application/json' }
    //       },
    //       willRespondWith: {
    //         status: 200,
    //         headers: { 'Content-Type': 'application/json' },
    //         body: {}
    //       }
    //     })
    //     expect(addInteractionPromise).to.eventually.not.have.property('providerState').notify(done)
    //   })

  });
});
