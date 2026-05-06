import { parseBody } from './parseBody';

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
