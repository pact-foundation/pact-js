import type { ConsumerInteraction } from '@pact-foundation/pact-core';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { XmlBuilder } from '../../v4';
import { RequestBuilder } from './requestBuilder';

chai.use(sinonChai);

const { expect } = chai;

describe('V4 RequestBuilder', () => {
  let withRequestBody: sinon.SinonStub;
  let interaction: ConsumerInteraction;
  let builder: RequestBuilder;

  beforeEach(() => {
    withRequestBody = sinon.stub();
    interaction = { withRequestBody } as unknown as ConsumerInteraction;
    builder = new RequestBuilder(interaction);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#xmlBody', () => {
    it('calls withRequestBody with application/xml content type', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build((el) => {
        el.appendElement('item', new Map(), 'value');
      });

      builder.xmlBody(body);

      expect(withRequestBody).to.have.been.calledOnceWith(
        body,
        'application/xml',
      );
    });

    it('supports XmlBuilder with matchers', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'items').build((el) => {
        el.eachLike('item', new Map(), (item) => item.appendText('value'));
      });

      builder.xmlBody(body);

      expect(withRequestBody).to.have.been.calledOnceWith(
        body,
        'application/xml',
      );
    });

    it('returns the builder for chaining', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build(() => {});

      const result = builder.xmlBody(body);

      expect(result).to.equal(builder);
    });
  });
});
