import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import type { ConsumerPact } from '@pact-foundation/pact-core';
import { PactV3 } from './pact';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const { expect } = chai;

describe('PactV3', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('#executeTest', () => {
    const buildPactMock = (port: number): ConsumerPact => {
      return {
        addMetadata: sinon.stub().returns(true),
        newInteraction: sinon.stub(),
        pactffiCreateMockServerForTransport: sinon.stub().returns(port),
        mockServerMatchedSuccessfully: sinon.stub().returns(true),
        mockServerMismatches: sinon.stub().returns([]),
        cleanupMockServer: sinon.stub().returns(true),
        writePactFile: sinon.stub(),
        cleanupPlugins: sinon.stub(),
        addPlugin: sinon.stub(),
      } as unknown as ConsumerPact;
    };

    describe('CORS option', () => {
      it('passes corsPreflight: true by default when cors is not specified', async () => {
        const pactMock = buildPactMock(1234);
        const p = new PactV3({ consumer: 'A', provider: 'B' });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await p.executeTest(async () => Promise.resolve());

        expect(
          (pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub)
            .calledOnce,
        ).to.be.true;
        const [, , config] = (
          pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub
        ).firstCall.args;
        expect(JSON.parse(config)).to.deep.equal({ corsPreflight: true });
      });

      it('passes corsPreflight: true when cors is explicitly true', async () => {
        const pactMock = buildPactMock(1234);
        const p = new PactV3({ consumer: 'A', provider: 'B', cors: true });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await p.executeTest(async () => Promise.resolve());

        const [, , config] = (
          pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub
        ).firstCall.args;
        expect(JSON.parse(config)).to.deep.equal({ corsPreflight: true });
      });

      it('passes corsPreflight: false when cors is explicitly false', async () => {
        const pactMock = buildPactMock(1234);
        const p = new PactV3({ consumer: 'A', provider: 'B', cors: false });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await p.executeTest(async () => Promise.resolve());

        const [, , config] = (
          pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub
        ).firstCall.args;
        expect(JSON.parse(config)).to.deep.equal({ corsPreflight: false });
      });
    });

    describe('transport scheme', () => {
      it('uses http scheme by default', async () => {
        const pactMock = buildPactMock(1234);
        const p = new PactV3({ consumer: 'A', provider: 'B' });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await p.executeTest(async () => Promise.resolve());

        const [, transport] = (
          pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub
        ).firstCall.args;
        expect(transport).to.eq('http');
      });

      it('uses https scheme when tls is true', async () => {
        const pactMock = buildPactMock(1234);
        const p = new PactV3({ consumer: 'A', provider: 'B', tls: true });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await p.executeTest(async () => Promise.resolve());

        const [, transport] = (
          pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub
        ).firstCall.args;
        expect(transport).to.eq('https');
      });
    });

    describe('when the mock server fails to start', () => {
      it('throws an error when port is 0 or negative', async () => {
        const pactMock = buildPactMock(-3);
        const p = new PactV3({ consumer: 'A', provider: 'B' });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await expect(
          p.executeTest(async () => Promise.resolve()),
        ).to.be.rejectedWith('Failed to start mock server');
      });
    });
  });
});
