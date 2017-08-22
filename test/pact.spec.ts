'use strict'
import { MockService } from '../src/dsl/mockService';
import { Pact as PactType, PactOptions } from '../src/pact';
import * as sinon from 'sinon';
import { expect } from 'chai';
import * as proxyquire from 'proxyquire';

describe('Pact', () => {
  const defaults = {
    consumer: 'A',
    provider: 'B'
  } as PactOptions;

  describe('#constructor', () => {
    let mockServiceSpy: sinon.SinonStub;
    let pactNodeSpy: sinon.SinonStub;
    let Pact: any; // PactType;
    let pact: PactType;
    // let pactServer: any; //Pact;

    beforeEach(() => {
      mockServiceSpy = sinon.stub();
      pactNodeSpy = sinon.stub();
      // const imported = proxyquire('../src/pact', { './dsl/mockService': { MockService: mockServiceSpy } });
      const imported = proxyquire('../src/pact', { '@pact-foundation/pact-node': pactNodeSpy });
      Pact = imported.Pact;
    });

    afterEach(() => {
      mockServiceSpy.reset();
    });

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
    })

    it('aoeuaoe', () => {
      const b = Object.create(Pact.prototype);
      b.mockService = mockServiceSpy;
      console.log(b);
    })

    // it('creates mockService with custom ip and port', (done) => {
    //   pact = Pact({ consumer: 'A', provider: 'B', host: '192.168.10.1', port: 8443, ssl: true })
    //   expect(pact).to.have.property('addInteraction')
    //   expect(pact).to.have.property('verify')
    //   expect(pact).to.have.property('finalize')
    //   expect(mockServiceSpy).to.have.been.calledWithNew
    //   expect(mockServiceSpy).to.have.been.calledWith('A', 'B', 8443, '192.168.10.1', true)
    //   done()
    // })

    // })

    // describe('#addInteraction', () => {
    //   let pact, Pact
    //   let port = 4567

    //   beforeEach(() => {
    //     Pact = proxyquire('../src/pact', {
    //       './dsl/mockService': function () {
    //         return { addInteraction: (int) => Promise.resolve(int.json()) }
    //       }
    //     })
    //     pact = Pact({ consumer: 'A', provider: 'B', port: port++ })
    //   })

    //   it('creates interaction with state', (done) => {
    //     let addInteractionPromise = pact.addInteraction({
    //       state: 'i have a list of projects',
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
    //     expect(addInteractionPromise).to.eventually.have.property('providerState').notify(done)
    //   })

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
  })
})
