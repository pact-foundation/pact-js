import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import { HTTPMethods, Request } from './request';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Request', () => {
  let request: Request;
  const port = 1024 + Math.floor(Math.random() * 5000);
  const url = `http://localhost:${port}`;
  const urlSecure = `https://localhost:${port}`;

  beforeEach(() => {
    request = new Request();
  });

  context('#send', () => {
    afterEach(() => nock.cleanAll());

    describe('Promise', () => {
      it('returns a promise', () => {
        nock(url).get('/').reply(200);
        const r = request.send(HTTPMethods.GET, url);
        return Promise.all([
          expect(r).is.ok,
          expect(r.then).is.ok,
          expect(r.then).is.a('function'),
          expect(r).to.be.fulfilled,
        ]);
      });

      it('resolves when request succeeds with response body', () => {
        const body = 'body';
        nock(url).get('/').reply(200, body);
        const p = request.send(HTTPMethods.GET, url);
        return Promise.all([
          expect(p).to.be.fulfilled,
          expect(p).to.eventually.be.equal(body),
        ]);
      });

      it('rejects when request fails with error message', () => {
        const error = 'error';
        nock(url).get('/').reply(400, error);
        const p = request.send(HTTPMethods.GET, url);
        return expect(p).to.be.rejectedWith(error);
      });
    });
    describe('Headers', () => {
      it('sends Pact headers are sent with every request', () => {
        nock(url)
          .matchHeader('X-Pact-Mock-Service', 'true')
          .get('/')
          .reply(200);
        return expect(request.send(HTTPMethods.GET, url)).to.be.fulfilled;
      });
    });
    describe('SSL', () => {
      it('ignores self signed certificate errors', () => {
        nock(urlSecure)
          .matchHeader('X-Pact-Mock-Service', 'true')
          .get('/')
          .reply(200);
        return expect(request.send(HTTPMethods.GET, urlSecure)).to.be.fulfilled;
      });
    });
  });
});
