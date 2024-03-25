import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { parseBody } from './parseBody';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Verifier', () => {
  describe('#parseBody', () => {
    describe('when request body exists', () => {
      it('it returns the request body buffer', async () => {
        const req: any = { body: '' };
        req.body = Buffer.from('foo');

        const body = parseBody(req);

        expect(body).to.be.instanceOf(Buffer);
        expect(body.toString()).to.eq('foo');
      });

      it('it returns a buffer of the request body object', async () => {
        const req: any = { body: { foo: 'bar' } };

        const body = parseBody(req);

        expect(body).to.be.instanceOf(Buffer);
        expect(body.toString()).to.eq(JSON.stringify(req.body));
      });
    });

    describe('when request body does not exist', () => {
      it('returns an empty buffer', async () => {
        const req: any = 'foo';

        const body = parseBody(req);

        expect(body).to.be.instanceOf(Buffer);
        expect(body).to.not.have.length;
        expect(body.toString()).to.be.empty;
      });
    });
  });
});
