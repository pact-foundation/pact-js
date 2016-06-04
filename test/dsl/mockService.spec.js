import nock from 'nock'
import { expect } from 'chai'

import MockService from '../../src/dsl/mockService'
import Interaction from '../../src/dsl/interaction'

describe('MockService', () => {

  after(() => {
    nock.restore()
  })

  describe('#constructor', () => {
    it('creates a MockService when all mandatory parameters are in', () => {
      const mock = new MockService('consumer', 'provider', 1234)
      expect(mock).to.not.be.undefined
      expect(mock._baseURL).to.eql('http://127.0.0.1:1234')
    })

    it('creates a MockService when port is not informed', () => {
      const mock = new MockService('consumer', 'provider')
      expect(mock).to.not.be.undefined
      expect(mock._baseURL).to.eql('http://127.0.0.1:1234')
    })

    it('does not create a MockService when consumer is not informed', () => {
      expect(() => { new MockService() })
        .to.throw(Error, 'Please provide the names of the provider and consumer for this Pact.')
    })

    it('does not create a MockService when provider is not informed', () => {
      expect(() => { new MockService('consumer') })
        .to.throw(Error, 'Please provide the names of the provider and consumer for this Pact.')
    })
  })

  describe('#addInteraction', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    const interaction = new Interaction()
    interaction.uponReceiving('duh').withRequest('get', '/search').willRespondWith(200)

    it('when Interaction added successfully', (done) => {
      nock(mock._baseURL).post(/interactions$/).reply(200)
      expect(mock.addInteraction(interaction)).to.eventually.notify(done)
    })

    it('when Interaction fails to be added', (done) => {
      nock(mock._baseURL).post(/interactions$/).reply(500)
      expect(mock.addInteraction(interaction)).to.eventually.be.rejected
      done()
    })
  })

  describe('#removeInteractions', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    it('when interactions are removed successfully', (done) => {
      nock(mock._baseURL).delete(/interactions$/).reply(200)
      expect(mock.removeInteractions()).to.eventually.notify(done)
    })

    it('when interactions fail to be removed', (done) => {
      nock(mock._baseURL).delete(/interactions$/).reply(500)
      expect(mock.removeInteractions()).to.eventually.be.rejected
      done()
    })
  })

  describe('#putInteractions', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    const interactions = [
      new Interaction().uponReceiving('duh').withRequest('get', '/search'),
      new Interaction().uponReceiving('dah').withRequest('POST', '/search'),
      new Interaction().uponReceiving('doh').withRequest('DELETE', '/search')
    ]

    interactions.forEach((i) => i.willRespondWith(200))

    it('when Interactions added successfully', (done) => {
      nock(mock._baseURL).put(/interactions$/).reply(200)
      expect(mock.putInteractions(interactions)).to.eventually.notify(done)
    })

    it('when Interactions fails to be added', (done) => {
      nock(mock._baseURL).put(/interactions$/).reply(500)
      expect(mock.putInteractions(interactions)).to.eventually.be.rejected
      done()
    })
  })

  describe('#verify', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    it('when verification is successful', (done) => {
      nock(mock._baseURL).get(/interactions\/verification$/).reply(200)
      expect(mock.verify()).to.eventually.notify(done)
    })

    it('when verification fails', (done) => {
      nock(mock._baseURL).get(/interactions\/verification$/).reply(500)
      expect(mock.verify()).to.eventually.be.rejected
      done()
    })
  })

  describe('#writePact', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    it('when writing is successful', (done) => {
      nock(mock._baseURL).post(/pact$/).reply(200)
      expect(mock.writePact()).to.eventually.notify(done)
    })

    it('when writing fails', (done) => {
      nock(mock._baseURL).post(/pact$/).reply(500)
      expect(mock.writePact()).to.eventually.be.rejected
      done()
    })
  })

  describe('#verifyAndWrite', () => {
    const mock = new MockService('consumer', 'provider', 1234)

    it('when verification and writing are successful', (done) => {
      nock(mock._baseURL).get(/interactions\/verification$/).reply(200)
      nock(mock._baseURL).post(/pact$/).reply(200)

      expect(mock.verifyAndWrite()).to.eventually.notify(done)
    })

    it('when verification succeeds and writing fails', (done) => {
      nock(mock._baseURL).get(/interactions\/verification$/).reply(200)
      nock(mock._baseURL).post(/pact$/).reply(500)
      expect(mock.verifyAndWrite()).to.eventually.be.rejected
      done()
    })

    it('when verification fails', (done) => {
      nock(mock._baseURL).get(/interactions\/verification$/).reply(500)
      expect(mock.verifyAndWrite()).to.eventually.be.rejected
      done()
    })
  })
})
