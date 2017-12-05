'use strict'
import { Interaction, InteractionObject } from './dsl/interaction';
import { MockService } from './dsl/mockService';
import { PactWeb } from './pact-web';
import { PactOptions, PactOptionsComplete } from './dsl/options';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

const expect = chai.expect;
const proxyquire = require('proxyquire').noCallThru();
chai.use(sinonChai)
chai.use(chaiAsPromised)

describe('PactWeb', () => {
  const fullOpts = {
    consumer: 'A',
    provider: 'B',
    port: 1234,
    host: '127.0.0.1',
    ssl: false,
    logLevel: 'info',
    spec: 2,
    cors: false,
    pactfileWriteMode: 'overwrite'
  } as PactOptionsComplete;

  const sandbox = sinon.sandbox.create({
    injectInto: null,
    properties: ['spy', 'stub', 'mock'],
    useFakeTimers: false,
    useFakeServer: false
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#constructor', () => {
    const defaults = {
      consumer: 'A',
      provider: 'B'
    } as PactOptions;

    it('throws Error when consumer not provided', () => {
      expect(() => { new PactWeb({ 'consumer': '', 'provider': 'provider' }) }).
        not.to.throw(Error, 'You must specify a Consumer for this pact.');
    });

    it('throws Error when provider not provided', () => {
      expect(() => { new PactWeb({ 'consumer': 'someconsumer', 'provider': '' }) }).
        not.to.throw(Error, 'You must specify a Provider for this pact.');
    });
  });


  describe('#addInteraction', () => {
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
        const pact = <PactWeb><any>Object.create(PactWeb.prototype);
        pact.opts = fullOpts;
        pact.mockService = <MockService><any>{
          addInteraction: (int: InteractionObject): Promise<string | undefined> => Promise.resolve(int.state)
        };
        expect(pact.addInteraction(interaction)).to.eventually.have.property('providerState').notify(done)
      });
    });

    describe('when not given a provider state', () => {
      it('creates interaction with state', (done) => {
        const pact = <PactWeb><any>Object.create(PactWeb.prototype);
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
    const Pact = PactWeb;

    describe('when pact verification is successful', () => {
      it('should return a successful promise and remove interactions', (done) => {
        const verifyStub = sandbox.stub(MockService.prototype, 'verify');
        verifyStub.resolves('verified!');
        const removeInteractionsStub = sandbox.stub(MockService.prototype, 'removeInteractions');
        removeInteractionsStub.resolves('removeInteractions');

        const b = <PactWeb><any>Object.create(PactWeb.prototype);
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

        const b = <PactWeb><any>Object.create(PactWeb.prototype);
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

          const b = <PactWeb><any>Object.create(PactWeb.prototype);
          b.opts = fullOpts;
          b.mockService = <MockService><any>{ verify: verifyStub, removeInteractions: removeInteractionsStub };

          expect(b.verify()).to.eventually.be.rejectedWith(Error).notify(done)
        });
      });
    });
  });

  describe('#finalize', () => {
    const Pact = PactWeb;

    describe('when writing Pact is successful', () => {
      it('should return a successful promise and shut down down the mock server', (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, 'writePact').resolves('pact file written!');

        const p = <PactWeb><any>Object.create(PactWeb.prototype);
        p.opts = fullOpts;
        p.mockService = <MockService><any>{ writePact: writePactStub, removeInteractions: sandbox.stub() };

        const writePactPromise = p.finalize();
        expect(writePactPromise).to.eventually.be.fulfilled.notify(done);
      });
    });

    describe('when writing Pact is unsuccessful', () => {
      it('should throw an error', (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, 'writePact').rejects('pact not file written!');

        const p = <PactWeb><any>Object.create(PactWeb.prototype);
        p.opts = fullOpts;
        p.mockService = <MockService><any>{ writePact: writePactStub, removeInteractions: sandbox.stub() };

        const writePactPromise = p.finalize();
        expect(writePactPromise).to.eventually.be.rejectedWith(Error).notify(done);
      });
    });
  });

  describe('#writePact', () => {
    const Pact = PactWeb;

    describe('when writing Pact is successful', () => {
      it('should return a successful promise', (done) => {
        const writePactStub = sandbox.stub(MockService.prototype, 'writePact').resolves('pact file written!');

        const p = <PactWeb><any>Object.create(PactWeb.prototype);
        p.opts = fullOpts;
        p.mockService = <MockService><any>{ writePact: writePactStub, removeInteractions: sandbox.stub() };

        const writePactPromise = p.writePact();
        expect(writePactPromise).to.eventually.eq('pact file written!');
        expect(writePactPromise).to.eventually.be.fulfilled.notify(done);
      });
    });
  });

  describe('#removeInteractions', () => {
    const Pact = PactWeb;

    describe('when removing interactions is successful', () => {
      it('should return a successful promise', (done) => {
        const removeInteractionsStub = sandbox.stub(MockService.prototype, 'removeInteractions').resolves('interactions removed!');

        const p = <PactWeb><any>Object.create(PactWeb.prototype);
        p.opts = fullOpts;
        p.mockService = <MockService><any>{ removeInteractions: removeInteractionsStub };

        const removeInteractionsPromise = p.removeInteractions();
        expect(removeInteractionsPromise).to.eventually.eq('interactions removed!');
        expect(removeInteractionsPromise).to.eventually.be.fulfilled.notify(done);
      });
    });
  });
});
