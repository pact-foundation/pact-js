var sinon = require('sinon')
var expect = require('chai').expect
var Request = require('../../src/common/request')

describe('Request', () => {

  var request

  before(() => {
    global.window = {
      XMLHttpRequest: function () {
        return {
          open: function() {},
          setRequestHeader: function() {},
          send: function() {}
        }
      }
    }

    request = new Request()
  })

  after(() => {
    global.window = undefined
  })

  it('should have "XMLHttpRequest" _request', function () {
    expect(request._request).to.not.be.null
    expect(request._request.open).to.be.a('function')
    expect(request._request.setRequestHeader).to.be.a('function')
    expect(request._request.send).to.be.a('function')
  })

  context('#send', () => {
    describe('asserting invocations are in place', () => {
      var _requestMock

      beforeEach(() => {
        _requestMock = sinon.mock(request._request)

        _requestMock.expects('open').withArgs('GET', 'http://localhost:8888', true)
        _requestMock.expects('setRequestHeader').withArgs('X-Pact-Mock-Service', 'true')
        _requestMock.expects('setRequestHeader').withArgs('Content-Type', 'application/json')
        _requestMock.expects('send').withArgs({})
      })

      afterEach(() => {
        _requestMock.restore()
      })

      it('should have sent headers and body to the correct URL', function (done) {
        request.send('GET', 'http://localhost:8888', {})
        _requestMock.verify()
        done()
      })
    })

    describe('with a successful request', () => {
      beforeEach(() => {
        sinon.stub(request._request, 'send', () => {
          request._request.status = 200
          request._request.responseText = 'it works'
          request._request.onload()
        })
      })

      afterEach(() => {
        request._request.send.restore()
      })

      it('should resolve the promise', function () {
        expect(request.send('GET', 'http://localhost:8888', {})).to.have.been.fulfilled
      })
    })

    describe('with an unsuccessful request', () => {
      beforeEach(() => {
        sinon.stub(request._request, 'send', () => {
          request._request.status = 404
          request._request.responseText = 'it does not work'
          request._request.onload()
        })
      })

      afterEach(() => {
        request._request.send.restore()
      })

      it('should reject the promise', function () {
        expect(request.send('GET', 'http://localhost:8888', {})).to.have.been.rejected
      })
    })
  })
})
