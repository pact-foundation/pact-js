import type { ConsumerInteraction } from '@pact-foundation/pact-core';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { XmlBuilder } from '../../v4';
import { RequestWithPluginBuilder } from './requestWithPluginBuilder';

chai.use(sinonChai);

const { expect } = chai;

describe('V4 RequestWithPluginBuilder', () => {
  let withRequestBody: sinon.SinonStub;
  let interaction: ConsumerInteraction;
  let builder: RequestWithPluginBuilder;

  beforeEach(() => {
    withRequestBody = sinon.stub();
    interaction = { withRequestBody } as unknown as ConsumerInteraction;
    builder = new RequestWithPluginBuilder(interaction);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#xmlBody', () => {
    it('delegates to parent and calls withRequestBody with application/xml', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build((el) => {
        el.appendElement('item', new Map(), 'value');
      });

      builder.xmlBody(body);

      expect(withRequestBody).to.have.been.calledOnceWith(
        body,
        'application/xml',
      );
    });

    it('returns a V4RequestWithPluginBuilder for chaining', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build(() => {});

      const result = builder.xmlBody(body);

      expect(result).to.equal(builder);
    });
  });
});
