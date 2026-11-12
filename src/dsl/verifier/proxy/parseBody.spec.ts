import {
  parseBody,
  recordUrlEncodedRawBody,
  snapshotParsedUrlEncodedBody,
} from './parseBody';

describe('Verifier', () => {
  describe('#parseBody', () => {
    describe('when request body exists', () => {
      it('it returns the request body buffer', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: partial mock — only body is needed to exercise parseBody
        const req: any = { body: '' };
        req.body = Buffer.from('foo');

        const body = parseBody(req);

        expect(body).toBeInstanceOf(Buffer);
        expect(body.toString()).toBe('foo');
      });

      it('it returns a buffer of the request body object', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: partial mock — only body is needed to exercise parseBody
        const req: any = { body: { foo: 'bar' } };

        const body = parseBody(req);

        expect(body).toBeInstanceOf(Buffer);
        expect(body.toString()).toBe(JSON.stringify(req.body));
      });

      it('it returns a buffer for an empty JSON object body', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: partial mock — only body is needed to exercise parseBody
        const req: any = { body: {} };

        const body = parseBody(req);

        expect(body).toBeInstanceOf(Buffer);
        expect(body.toString()).toBe('{}');
      });

      it('serializes application/x-www-form-urlencoded object bodies as form data instead of JSON', () => {
        // biome-ignore lint/suspicious/noExplicitAny: partial mock — headers and body are needed to exercise urlencoded serialization
        const req: any = {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
          },
          body: {
            grant_type: 'client_credentials',
            tags: ['a', 'b'],
            nested: { key: 'val' },
          },
        };

        const body = parseBody(req);

        expect(body).toBeInstanceOf(Buffer);
        expect(body.toString()).toBe(
          'grant_type=client_credentials&tags=a&tags=b&nested%5Bkey%5D=val',
        );
      });

      it('preserves recorded raw form-urlencoded bytes unless request body is mutated', () => {
        const raw = Buffer.from(
          'scope=read+write&grant_type=client_credentials',
        );
        // biome-ignore lint/suspicious/noExplicitAny: partial mock — headers and body simulate parsed urlencoded middleware state
        const req: any = {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: { scope: 'read write', grant_type: 'client_credentials' },
        };

        recordUrlEncodedRawBody(req, raw);
        snapshotParsedUrlEncodedBody(req);

        expect(parseBody(req).toString()).toBe(
          'scope=read+write&grant_type=client_credentials',
        );

        req.body.extra = 'added';
        expect(parseBody(req).toString()).toBe(
          'scope=read%20write&grant_type=client_credentials&extra=added',
        );
      });
    });

    describe('when a requestFilter replaced the body with a string', () => {
      it('forwards the string verbatim', () => {
        // biome-ignore lint/suspicious/noExplicitAny: partial mock — only body is needed to exercise parseBody
        const req: any = { body: '{"foo":"bar"}' };

        const body = parseBody(req);

        expect(body).toBeInstanceOf(Buffer);
        expect(body.toString()).toBe('{"foo":"bar"}');
      });

      it('forwards a string body for a form request instead of the recorded raw bytes', () => {
        // biome-ignore lint/suspicious/noExplicitAny: partial mock — only headers and body are needed to exercise parseBody
        const req: any = {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: { grant_type: 'client_credentials' },
        };
        recordUrlEncodedRawBody(
          req,
          Buffer.from('grant_type=client_credentials'),
        );
        snapshotParsedUrlEncodedBody(req);
        req.body = 'grant_type=password&user=caf%C3%A9';

        expect(parseBody(req).toString()).toBe(
          'grant_type=password&user=caf%C3%A9',
        );
      });

      it('encodes multi-byte characters as UTF-8', () => {
        // biome-ignore lint/suspicious/noExplicitAny: partial mock — only body is needed to exercise parseBody
        const req: any = { body: 'café' };

        expect(parseBody(req)).toHaveLength(Buffer.byteLength('café'));
      });
    });

    describe('when request body does not exist', () => {
      it('returns an empty buffer', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: passing a non-object to test the absent-body branch
        const req: any = 'foo';

        const body = parseBody(req);

        expect(body).toBeInstanceOf(Buffer);
        expect(body).toHaveLength(0);
        expect(body.toString()).toBe('');
      });
    });
  });
});
