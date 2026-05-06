import nock from 'nock';
import { HTTPMethods, Request } from './request';

describe('Request', () => {
  let request: Request;
  const port = 1024 + Math.floor(Math.random() * 5000);
  const url = `http://localhost:${port}`;
  const urlSecure = `https://localhost:${port}`;

  beforeEach(() => {
    request = new Request();
  });

  describe('#send', () => {
    afterEach(() => nock.cleanAll());

    describe('Promise', () => {
      it('returns a promise', async () => {
        nock(url).get('/').reply(200);
        const r = request.send(HTTPMethods.GET, url);
        expect(r).toBeTruthy();
        expect(r.then).toBeTruthy();
        expect(r.then).toBeTypeOf('function');
        await r;
      });

      it('resolves when request succeeds with response body', async () => {
        const body = 'body';
        nock(url).get('/').reply(200, body);
        await expect(request.send(HTTPMethods.GET, url)).resolves.toBe(body);
      });

      it('rejects when request fails with error message', async () => {
        const error = 'error';
        nock(url).get('/').reply(400, error);
        await expect(request.send(HTTPMethods.GET, url)).rejects.toThrow(error);
      });
    });
    describe('Headers', () => {
      it('sends Pact headers are sent with every request', async () => {
        nock(url)
          .matchHeader('X-Pact-Mock-Service', 'true')
          .get('/')
          .reply(200);
        await request.send(HTTPMethods.GET, url);
      });
    });
    describe('SSL', () => {
      it('ignores self signed certificate errors', async () => {
        nock(urlSecure)
          .matchHeader('X-Pact-Mock-Service', 'true')
          .get('/')
          .reply(200);
        await request.send(HTTPMethods.GET, urlSecure);
      });
    });
  });
});
