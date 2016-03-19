import nock from 'nock'
import sinon from 'sinon'
import { expect } from 'chai'
import request from 'superagent-bluebird-promise'

import Interceptor from '../../src/pact-consumer-dsl/interceptor'

describe('Interceptor', () => {

  describe('#constructor', () => {
    it('creates Interceptor for targetHost', () => {
      const interceptor = new Interceptor('www.google.com.au', 'http://proxy:1234')
      expect(interceptor).to.not.be.undefined
      interceptor.disable()
    })

    it('does not create Interceptor when params are missing', () => {
      expect(() => new Interceptor()).to.throw(Error, 'Please provide a target host and a proxy host to route the request to.')
    })

    describe('mitm interceptor', () => {
      const interceptor = new Interceptor('www.google.com.au', 'http://proxy:1234')

      before(() => {
        sinon.spy(interceptor.mitm, 'on')
        interceptor.interceptRequests()
      })

      after(() => {
        interceptor.mitm.on.restore()
        interceptor.disable()
      })

      it('is listening on "connect"', () => {
        expect(interceptor.mitm.on).to.have.been.calledWith('connection')
      })

      it('is listening on "request"', () => {
        expect(interceptor.mitm.on).to.have.been.calledWith('request')
      })
    })
  })

  xdescribe('when host is supposed to be intercepted', () => {
    var interceptorSpy
    const interceptor = new Interceptor('www.google.com.au', 'http://proxy:1234')

    after(() => {
      interceptor.disable()
    })

    it('intercepts the request going to "www.google.com.au"', (done) => {
      nock('http://proxy:1234').get('/search?q=test').reply(200)

      sinon.stub(interceptor.mitm, 'on', function (type, fn) {
        interceptorSpy = sinon.spy(fn)
        if (type === 'connect') {
          interceptorSpy(sinon.stub(), { host: 'www.google.com.au' })
        } else {
          interceptorSpy({ method: 'GET', url: '/search?q=test' }, { end: () => {} })
        }
      })

      interceptor.interceptRequests()

      request.get('http://www.google.com.au/search?q=test')
        .then(() => {
          expect(interceptorSpy).to.have.been.calledOnce
          done()
        })
    })
  })

  xdescribe('when host is not supposed to be intercepted', () => {
    var interceptorSpy
    const interceptor = new Interceptor('www.google.com.au', 'http://proxy:1234')

    after(() => {
      interceptor.disable()
    })

    xit('request goes through to "au.search.yahoo.com"', (done) => {
      nock('http://proxy:1234').get('/search?q=test').reply(200)

      sinon.stub(interceptor.mitm, 'on', function (type, fn) {
        interceptorSpy = sinon.spy(fn)
        if (type === 'connect') {
          interceptorSpy(sinon.stub(), { host: 'www.google.com.au' })
        } else {
          interceptorSpy({ method: 'GET', url: '/search?q=test' }, { end: () => {} })
        }
      })

      interceptor.interceptRequests()

      request.get('https://au.search.yahoo.com/search?p=test')
        .then(() => {
          expect(interceptorSpy).to.not.have.been.called
          done()
        })
    })
  })

  describe('#addRequestHeaders', () => {
    const interceptor = new Interceptor('www.google.com.au', 'http://proxy:1234')

    it('clone headers', () => {
      interceptor.addRequestHeaders({ Header1: 'Value 1', Header2: 'Value 2' })
      expect(interceptor.requestHeaders).to.eql({ Header1: 'Value 1', Header2: 'Value 2' })
    })

    it('has empty headers when headers not passed in', () => {
      interceptor.addRequestHeaders()
      expect(interceptor.requestHeaders).to.eql({})
    })
  })
})
