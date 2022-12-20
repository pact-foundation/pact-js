import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PactOptions, PactOptionsComplete } from '../dsl/options';
import { Pact } from '.';
import { ConsumerInteraction, ConsumerPact } from '@pact-foundation/pact-core';
import { MockService } from '../dsl/mockService';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const { expect } = chai;

describe('Pact', () => {
  const fullOpts = {
    consumer: 'A',
    provider: 'B',
    port: 1234,
    host: '127.0.0.1',
    ssl: false,
    logLevel: 'info',
    spec: 2,
    cors: false,
    pactfileWriteMode: 'merge',
  } as PactOptionsComplete;

  afterEach(() => {
    sinon.restore();
  });

  describe('#constructor', () => {
    it('throws Error when consumer not provided', () => {
      expect(() => {
        new Pact({ consumer: '', provider: 'provider' });
      }).to.throw(Error, 'You must specify a Consumer for this pact.');
    });

    it('throws Error when provider not provided', () => {
      expect(() => {
        new Pact({ consumer: 'someconsumer', provider: '' });
      }).to.throw(Error, 'You must specify a Provider for this pact.');
    });
  });

  describe('#createOptionsWithDefault', () => {
    const constructorOpts: PactOptions = {
      consumer: 'A',
      provider: 'B',
    };

    it('merges options with sensible defaults', () => {
      const opts = Pact.createOptionsWithDefaults(constructorOpts);
      expect(opts.consumer).to.eq('A');
      expect(opts.provider).to.eq('B');
      expect(opts.cors).to.eq(false);
      expect(opts.host).to.eq('127.0.0.1');
      expect(opts.logLevel).to.eq('info');
      expect(opts.spec).to.eq(2);
      expect(opts.dir).not.to.be.empty;
      expect(opts.log).not.to.be.empty;
      expect(opts.pactfileWriteMode).to.eq('merge');
      expect(opts.ssl).to.eq(false);
      expect(opts.sslcert).to.eq(undefined);
      expect(opts.sslkey).to.eq(undefined);
    });
  });

  describe('#setup', () => {
    describe('when server is properly configured', () => {
      it('updates the mock service configuration', async () => {
        const p: Pact = new Pact(fullOpts);

        await p.setup();
        expect(p.mockService).to.deep.equal({
          baseUrl: 'http://127.0.0.1:1234',
          pactDetails: {
            pactfile_write_mode: 'merge',
            consumer: {
              name: 'A',
            },
            provider: { name: 'B' },
          },
        });
      });

      it('returns the current configuration', () => {
        const p: any = new Pact(fullOpts);

        return expect(p.setup()).to.eventually.include({
          consumer: 'A',
          provider: 'B',
          port: 1234,
          host: '127.0.0.1',
          ssl: false,
          logLevel: 'info',
          spec: 2,
          cors: false,
          pactfileWriteMode: 'merge',
        });
      });
    });

    describe('when a port is given', () => {
      it('checks if the port is available', () => {
        const p: any = new Pact(fullOpts);

        return expect(p.setup())
          .to.eventually.have.property('port')
          .eq(fullOpts.port);
      });
    });

    describe('when no port is given', () => {
      it('finds a free port', () => {
        const opts = {
          ...fullOpts,
          port: undefined,
        };
        const p: any = new Pact(opts);

        return expect(p.setup()).to.eventually.have.property('port').not
          .undefined;
      });
    });
  });

  describe('#addInteraction', () => {
    // This is more of an integration test, as the function has taken on a lot more
    // responsibility previously covered by other functions during the upgrade to
    // the rust core, to ensure the API remains backwards compatible
    it('sets the correct request and response details on the FFI and starts the mock server', () => {
      const p: Pact = new Pact(fullOpts);
      const uponReceiving = sinon.stub().returns(true);
      const given = sinon.stub().returns(true);
      const withRequest = sinon.stub().returns(true);
      const withRequestBody = sinon.stub().returns(true);
      const withRequestHeader = sinon.stub().returns(true);
      const withQuery = sinon.stub().returns(true);
      const withResponseBody = sinon.stub().returns(true);
      const withResponseHeader = sinon.stub().returns(true);
      const withStatus = sinon.stub().returns(true);
      const createMockServer = sinon.stub().returns(1234);
      const pactMock: ConsumerPact = {
        createMockServer,
      } as unknown as ConsumerPact; // TODO replace with proper mock
      const interactionMock: ConsumerInteraction = {
        uponReceiving,
        given,
        withRequest,
        withRequestBody,
        withRequestHeader,
        withQuery,
        withResponseBody,
        withResponseHeader,
        withStatus,
      } as unknown as ConsumerInteraction; // TODO replace with proper mock
      // @ts-ignore TODO refactor the class to remove the need for this
      p.pact = pactMock;
      // @ts-ignore: TODO refactor the class to remove the need for this
      p.interaction = interactionMock;
      p.mockService = {} as MockService;

      p.addInteraction({
        state: 'some state',
        uponReceiving: 'some description',
        withRequest: {
          method: 'GET',
          path: '/',
          body: { foo: 'bar' },
          headers: {
            'content-type': 'application/json',
            foo: 'bar',
          },
          query: {
            query: 'string',
            foo: 'bar',
          },
        },
        willRespondWith: {
          status: 200,
          body: { baz: 'bat' },
          headers: {
            'content-type': 'application/hal+json',
            foo: 'bar',
          },
        },
      });

      expect(uponReceiving.calledOnce).to.be.true;
      expect(given.calledOnce).to.be.true;
      expect(withRequest.calledOnce).to.be.true;
      expect(withQuery.calledTwice).to.be.true;
      expect(withRequestHeader.calledTwice).to.be.true;
      expect(withRequestBody.calledOnce).to.be.true;
      expect(withResponseBody.calledOnce).to.be.true;
      expect(withResponseHeader.calledTwice).to.be.true;

      // Pact mock server started
      expect(createMockServer.called).to.be.true;
    });
  });
});
