import sinon from 'sinon'
import { expect } from 'chai'
import request from 'superagent-bluebird-promise'

import Interceptor from '../../src/interceptor'

describe('Interceptor', () => {

  describe('#constructor', () => {
    it('creates Interceptor for targetHost', () => {
      const interceptor = new Interceptor('http://proxy:1234')
      expect(interceptor).to.not.be.undefined
      expect(interceptor.disabled).to.eql(true)
    })

    it('does not create Interceptor when proxy is missing', () => {
      expect(() => new Interceptor()).to.throw(Error, 'Please provide a proxy to route the request to.')
    })

    describe('mitm interceptor', () => {
      const interceptor = new Interceptor('http://proxy:1234')

      before(() => {
        sinon.spy(interceptor.mitm, 'on')
        interceptor.interceptRequestsOn('www.google.com.au')
      })

      after(() => {
        interceptor.mitm.on.restore()
        interceptor.stopIntercepting()
      })

      it('is listening on "connect"', () => {
        expect(interceptor.mitm.on).to.have.been.calledWith('connect')
      })

      it('is listening on "request"', () => {
        expect(interceptor.mitm.on).to.have.been.calledWith('request')
      })
    })
  })

  xdescribe('when host is supposed to be intercepted', () => {
    const interceptor = new Interceptor('http://localhost:1234')

    beforeEach(() => {
      interceptor.interceptRequestsOn('http://docs.pact.io')
    });

    afterEach(() => {
      interceptor.stopIntercepting()
    })

    it('intercepts the request going to "www.google.com.au"', (done) => {
      const nock = require('nock')
      nock('http://localhost:1234')
        .get('/documentation/javascript.html')
        .reply(200, { data: 'successfully intercepted' })

      request.get('http://docs.pact.io/documentation/javascript.html')
        .then((response) => {
          expect(JSON.parse(response.text)).to.eql({ data: 'successfully intercepted' })
          nock.restore()
          done()
        })
    })
  })
})
