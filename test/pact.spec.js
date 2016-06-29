import sinon from 'sinon'
import { expect } from 'chai'
import proxyquire from 'proxyquire'

describe('Pact', () => {

  describe('#constructor', ()  => {
    let mockServiceSpy, Pact

    beforeEach(() => {
      mockServiceSpy = sinon.spy()
      Pact = proxyquire('../src/pact', { './dsl/mockService': { default: mockServiceSpy } })
    })

    afterEach(() => {
      mockServiceSpy.reset()
    })

    it('throws Error when consumer not informed', () => {
      expect(() => { Pact({}) }).to.throw(Error, 'You must inform a Consumer for this Pact.')
    })

    it('throws Error when provider not informed', () => {
      expect(() => { Pact({ consumer: 'abc' }) }).to.throw(Error, 'You must inform a Provider for this Pact.')
    })

    it('returns object with three functions to be invoked', (done) => {
      let pact = Pact({ consumer: 'A', provider: 'B' })
      expect(pact).to.have.property('addInteraction')
      expect(pact).to.have.property('verify')
      expect(pact).to.have.property('finalize')
      expect(mockServiceSpy).to.have.been.calledWith('A', 'B', 1234)
      done()
    })

  })

  describe('#addInteraction', ()  => {
    let pact, Pact

    beforeEach(() => {
      Pact = proxyquire('../src/pact', { './dsl/mockService': { default: () => {
        return { addInteraction: (int) => Promise.resolve(int.json()) }
      } } })
      pact = Pact({ consumer: 'A', provider: 'B' })
    })

    it('creates interaction with state', (done) => {
      let addInteractionPromise = pact.addInteraction({
        state: 'i have a list of projects',
        uponReceiving: 'a request for projects',
        withRequest: {
          method: 'get',
          path: '/projects',
          headers: { 'Accept': 'application/json' }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { }
        }
      })
      expect(addInteractionPromise).to.eventually.have.property('provider_state').notify(done)
    })

    it('creates interaction without state', (done) => {
      let addInteractionPromise = pact.addInteraction({
        uponReceiving: 'a request for projects',
        withRequest: {
          method: 'get',
          path: '/projects',
          headers: { 'Accept': 'application/json' }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { }
        }
      })
      expect(addInteractionPromise).to.eventually.not.have.property('provider_state').notify(done)
    })
  })
})
