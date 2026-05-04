import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import type { ConsumerPact } from '@pact-foundation/pact-core';
import { executeTest } from '.';
import type { PactV4Options } from './types';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const { expect } = chai;

describe('V4 HTTP executeTest', () => {
  afterEach(() => {
    sinon.restore();
  });

  const buildPactMock = (port: number): ConsumerPact => {
    return {
      pactffiCreateMockServerForTransport: sinon.stub().returns(port),
      mockServerMatchedSuccessfully: sinon.stub().returns(true),
      mockServerMismatches: sinon.stub().returns([]),
      cleanupMockServer: sinon.stub().returns(true),
      writePactFile: sinon.stub(),
      cleanupPlugins: sinon.stub(),
      addPlugin: sinon.stub(),
    } as unknown as ConsumerPact;
  };

  const baseOpts: PactV4Options = { consumer: 'A', provider: 'B' };

  describe('CORS option', () => {
    it('passes corsPreflight: true by default when cors is not specified', async () => {
      const pactMock = buildPactMock(1234);

      await executeTest(pactMock, baseOpts, async () => Promise.resolve(), () => {});

      const stub = pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub;
      expect(stub.calledOnce).to.be.true;
      const [, , config] = stub.firstCall.args;
      expect(JSON.parse(config)).to.deep.equal({ corsPreflight: true });
    });

    it('passes corsPreflight: true when cors is explicitly true', async () => {
      const pactMock = buildPactMock(1234);

      await executeTest(
        pactMock,
        { ...baseOpts, cors: true },
        async () => Promise.resolve(),
        () => {},
      );

      const stub = pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub;
      const [, , config] = stub.firstCall.args;
      expect(JSON.parse(config)).to.deep.equal({ corsPreflight: true });
    });

    it('passes corsPreflight: false when cors is explicitly false', async () => {
      const pactMock = buildPactMock(1234);

      await executeTest(
        pactMock,
        { ...baseOpts, cors: false },
        async () => Promise.resolve(),
        () => {},
      );

      const stub = pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub;
      const [, , config] = stub.firstCall.args;
      expect(JSON.parse(config)).to.deep.equal({ corsPreflight: false });
    });
  });

  describe('transport scheme', () => {
    it('uses http scheme by default', async () => {
      const pactMock = buildPactMock(1234);

      await executeTest(pactMock, baseOpts, async () => Promise.resolve(), () => {});

      const stub = pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub;
      const [, transport] = stub.firstCall.args;
      expect(transport).to.eq('http');
    });

    it('uses https scheme when tls is true', async () => {
      const pactMock = buildPactMock(1234);

      await executeTest(
        pactMock,
        { ...baseOpts, tls: true },
        async () => Promise.resolve(),
        () => {},
      );

      const stub = pactMock.pactffiCreateMockServerForTransport as sinon.SinonStub;
      const [, transport] = stub.firstCall.args;
      expect(transport).to.eq('https');
    });
  });

  describe('when the mock server fails to start', () => {
    it('throws an error when port is 0 or negative', async () => {
      const pactMock = buildPactMock(-3);

      await expect(
        executeTest(pactMock, baseOpts, async () => Promise.resolve(), () => {}),
      ).to.be.rejectedWith('Failed to start mock server');
    });
  });
});
