import * as sinon from 'sinon';
import * as chai from 'chai';
const expect = chai.expect;

import { Request } from '../../src/common/request';
declare global {
  interface Window { XMLHttpRequest(): any }
}

describe('Request', () => {

  let request: Request;

  before(() => {
    window.XMLHttpRequest = () => {
      return {
        open: () => { },
        setRequestHeader: () => { },
        send: () => { }
      }
    }
    request = new Request();
  });

  after(() => {
    // window = undefined;
  });

  it.only('should have "XMLHttpRequest" _request', () => {
    expect(request._request).to.not.be.null;
    expect(request._request.open).to.be.a('function');
    expect(request._request.setRequestHeader).to.be.a('function');
    expect(request._request.send).to.be.a('function');
  });

  // context('#send', () => {
  //   describe('asserting invocations are in place', () => {
  //     var _requestMock

  //     beforeEach(() => {
  //       _requestMock = sinon.mock(request._request)

  //       _requestMock.expects('open').withArgs('GET', 'http://localhost:8888', true)
  //       _requestMock.expects('setRequestHeader').withArgs('X-Pact-Mock-Service', 'true')
  //       _requestMock.expects('setRequestHeader').withArgs('Content-Type', 'application/json')
  //       _requestMock.expects('send').withArgs({})
  //     })

  //     afterEach(() => {
  //       _requestMock.restore()
  //     })

  //     it('should have sent headers and body to the correct URL', function (done) {
  //       request.send('GET', 'http://localhost:8888', {})
  //       _requestMock.verify()
  //       done()
  //     })
  //   })

  //   describe('with a successful request', () => {
  //     beforeEach(() => {
  //       sinon.stub(request._request, 'send', () => {
  //         request._request.status = 200
  //         request._request.responseText = 'it works'
  //         request._request.onload()
  //       })
  //     })

  //     afterEach(() => {
  //       request._request.send.restore()
  //     })

  //     it('should resolve the promise', function () {
  //       expect(request.send('GET', 'http://localhost:8888', {})).to.have.been.fulfilled
  //     })
  //   })

  //   describe('with an unsuccessful request', () => {
  //     beforeEach(() => {
  //       sinon.stub(request._request, 'send', () => {
  //         request._request.status = 404
  //         request._request.responseText = 'it does not work'
  //         request._request.onload()
  //       })
  //     })

  //     afterEach(() => {
  //       request._request.send.restore()
  //     })

  //     it('should reject the promise', function () {
  //       expect(request.send('GET', 'http://localhost:8888', {})).to.have.been.rejected
  //     })
  //   })
  // })
})
