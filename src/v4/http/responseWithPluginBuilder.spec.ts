import type { ConsumerInteraction } from '@pact-foundation/pact-core';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { XmlBuilder } from '../../v4';
import { ResponseWithPluginBuilder } from './responseWithPluginBuilder';

chai.use(sinonChai);

const { expect } = chai;

describe('V4 ResponseWithPluginBuilder', () => {
  let withResponseBody: sinon.SinonStub;
  let interaction: ConsumerInteraction;
  let builder: ResponseWithPluginBuilder;

  beforeEach(() => {
    withResponseBody = sinon.stub();
    interaction = { withResponseBody } as unknown as ConsumerInteraction;
    builder = new ResponseWithPluginBuilder(interaction);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#xmlBody', () => {
    it('calls withResponseBody with application/xml content type', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build((el) => {
        el.appendElement('item', new Map(), 'value');
      });

      builder.xmlBody(body);

      expect(withResponseBody).to.have.been.calledOnceWith(
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
