import type { ConsumerInteraction, ConsumerPact } from '@pact-foundation/pact-core';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { InteractionWithRequest } from './interactionWithRequest';
import { HTTPResponseStatusClass, matchStatus } from '../../v3/matchers';

chai.use(sinonChai);

const { expect } = chai;

describe('InteractionWithRequest', () => {
  let withStatus: sinon.SinonStub;
  let withResponseMatchingRules: sinon.SinonStub;
  let interaction: ConsumerInteraction;
  let pact: ConsumerPact;
  let cleanupFn: sinon.SinonStub;

  beforeEach(() => {
    withStatus = sinon.stub();
    withResponseMatchingRules = sinon.stub();
    interaction = {
      withStatus,
      withResponseMatchingRules,
    } as unknown as ConsumerInteraction;
    pact = {
      pactffiCreateMockServerForTransport: sinon.stub().returns(1234),
      mockServerMatchedSuccessfully: sinon.stub().returns(true),
      mockServerMismatches: sinon.stub().returns([]),
      cleanupMockServer: sinon.stub().returns(true),
      writePactFile: sinon.stub(),
      cleanupPlugins: sinon.stub(),
    } as unknown as ConsumerPact;
    cleanupFn = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#willRespondWith', () => {
    it('calls withStatus with a plain number', () => {
      const req = new InteractionWithRequest(pact, interaction, { consumer: 'A', provider: 'B' }, cleanupFn);

      req.willRespondWith(200);

      expect(withStatus).to.have.been.calledOnceWith(200);
      expect(withResponseMatchingRules).to.not.have.been.called;
    });

    it('calls withStatus with the example value from a StatusCodeMatcher', () => {
      const req = new InteractionWithRequest(pact, interaction, { consumer: 'A', provider: 'B' }, cleanupFn);
      const matcher = matchStatus(200, HTTPResponseStatusClass.Success);

      req.willRespondWith(matcher);

      expect(withStatus).to.have.been.calledOnceWith(200);
    });

    it('calls withResponseMatchingRules with the status code matcher FFI format when given a StatusCodeMatcher', () => {
      const req = new InteractionWithRequest(pact, interaction, { consumer: 'A', provider: 'B' }, cleanupFn);
      const matcher = matchStatus(200, HTTPResponseStatusClass.Success);

      req.willRespondWith(matcher);

      expect(withResponseMatchingRules).to.have.been.calledOnce;
      const rulesJson = JSON.parse(withResponseMatchingRules.firstCall.args[0]);
      expect(rulesJson).to.deep.equal({
        status: {
          $: {
            matchers: [{ match: 'statusCode', status: 'success' }],
          },
        },
      });
    });

    it('calls withResponseMatchingRules with specific status codes', () => {
      const req = new InteractionWithRequest(pact, interaction, { consumer: 'A', provider: 'B' }, cleanupFn);
      const matcher = matchStatus(200, [200, 201]);

      req.willRespondWith(matcher);

      expect(withResponseMatchingRules).to.have.been.calledOnce;
      const rulesJson = JSON.parse(withResponseMatchingRules.firstCall.args[0]);
      expect(rulesJson).to.deep.equal({
        status: {
          $: {
            matchers: [{ match: 'statusCode', status: [200, 201] }],
          },
        },
      });
    });

    it('does not call withResponseMatchingRules for a plain number', () => {
      const req = new InteractionWithRequest(pact, interaction, { consumer: 'A', provider: 'B' }, cleanupFn);

      req.willRespondWith(201);

      expect(withResponseMatchingRules).to.not.have.been.called;
    });
  });
});
