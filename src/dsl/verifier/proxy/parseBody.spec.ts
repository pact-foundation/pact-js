import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import * as http from 'http';

import { parseBody } from './parseBody';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Verifier', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('#parseBody', () => {
    let proxyReq: any;

    beforeEach(() => {
      proxyReq = sinon.createStubInstance(http.ClientRequest);
    });

    describe('when request body exists', () => {
      it('it writes the request if the body is a buffer', async () => {
        const req: any = { body: '' };
        req.body = Buffer.from('foo');
        parseBody(proxyReq, req);

        expect(proxyReq.setHeader).to.have.been.called;
        expect(proxyReq.write).to.have.been.called;
      });

      it('it writes the request if the body is an object', async () => {
        const req: any = { body: { foo: 'bar' } };
        parseBody(proxyReq, req);

        expect(proxyReq.setHeader).to.have.been.called;
        expect(proxyReq.write).to.have.been.called;
      });
    });

    describe('when request body does not exist', () => {
      it('it does not invoke the request rewrite', async () => {
        const req: any = 'foo';
        parseBody(proxyReq, req);

        expect(proxyReq.setHeader).to.have.not.been.called;
        expect(proxyReq.write).to.have.not.been.called;
      });
    });
  });
});
