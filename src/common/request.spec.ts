import { parse, Url, URL } from 'url';
import * as sinon from 'sinon';
import * as chai from 'chai';
const expect = chai.expect;
import { Request } from './request';

describe('Request', () => {
  let request: Request;

  before(() => {
    request = new Request();
  });

  after(() => {
  });

  context('#constructor', () => {
    describe('when running in a browser-based environment', () => {
      it.skip('should use "XMLHttpRequest" request object', () => {
        // Need to find an elegant way of turning on 'window' in TypeScript
        expect(request._request).to.not.be.undefined;
        expect(request._request).to.not.be.null;
        expect(request._request.open).to.be.a('function');
        expect(request._request.setRequestHeader).to.be.a('function');
        expect(request._request.send).to.be.a('function');
      });
    });
    describe('when running in a node-based environment', () => {
      it('should use "Request" objects', () => {
        expect(request._httpRequest).to.not.be.null;
        expect(request._httpRequest).to.not.be.undefined;
        expect(request._httpsRequest).to.not.be.null;
        expect(request._httpsRequest).to.not.be.undefined;
      });
    });
  });

  context('#send', () => {
    describe.only('asserting invocations are in place', () => {
      let requestMock: sinon.SinonMock;
      let responseMock: any;

      beforeEach(() => {
        requestMock = sinon.mock(request._httpRequest);
        responseMock = {
          statusCode: 200,
          setEncoding: () => { },
          on: (_: any, cb: (data: any) => any) => {
            cb('Response body!')
          }
        };

        const args: any = parse('http://localhost:8888/');
        args.method = 'GET';
        args.headers = {
          'X-Pact-Mock-Service': 'true',
          'Content-Type': 'application/json'
        };

        requestMock
          .expects('request')
          .atLeast(1)
          .withArgs(args)
          .returns({
            on: () => { },
            write: () => { },
            end: () => { }
          })
          .callsArgWith(1, responseMock);
      });

      afterEach(() => {
        requestMock.restore();
      });

      it('should have sent headers and body to the correct URL', (done) => {
        const reqPromise = request.send('GET', 'http://localhost:8888')
        requestMock.verify();
        expect(reqPromise).to.eventually.be.fulfilled.notify(done);
      });
    });

    describe('with a successful request', () => {
      beforeEach(() => {
        sinon.stub(request._request, 'send', () => {
          request._request.status = 200;
          request._request.responseText = 'it works';
          request._request.onload();
        });
      });

      afterEach(() => {
        request._request.send.restore();
      });

      it('should resolve the promise', () => {
        expect(request.send('GET', 'http://localhost:8888')).to.have.been.fulfilled;
      });
    });

    describe('with an unsuccessful request', () => {
      beforeEach(() => {
        sinon.stub(request._request, 'send', () => {
          request._request.status = 404;
          request._request.responseText = 'it does not work';
          request._request.onload();
        });
      });

      afterEach(() => {
        request._request.send.restore();
      });

      it('should reject the promise', function () {
        expect(request.send('GET', 'http://localhost:8888')).to.have.been.rejected;
      });
    });
  });
});
