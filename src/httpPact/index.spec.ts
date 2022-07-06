// @ts-nocheck
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import serviceFactory from '@pact-foundation/pact-core';
import { ImportMock } from 'ts-mock-imports';
import { PactOptions, PactOptionsComplete } from '../dsl/options';
import { Pact } from '.';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const { expect } = chai;

describe('Pact', () => {
  let pact: Pact;
  const fullOpts = {
    consumer: 'A',
    provider: 'B',
    port: 1234,
    host: '127.0.0.1',
    ssl: false,
    logLevel: 'info',
    spec: 2,
    cors: false,
    pactfileWriteMode: 'overwrite',
  } as PactOptionsComplete;

  before(() => {
    // Stub out pact-core
    const manager = ImportMock.mockClass(serviceFactory, 'createServer') as any;
    manager.mock('createServer', () => {});
  });

  beforeEach(() => {
    pact = Object.create(Pact.prototype) as any as Pact;
    pact.opts = fullOpts;
  });

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
    const serverMock = {
      start: () => Promise.resolve(),
      options: { port: 1234 },
      logLevel: () => {},
    };

    describe('when server is properly configured', () => {
      it('starts the mock server in the background', () => {
        const p: any = new Pact(fullOpts);

        p.server = serverMock;

        return expect(p.setup()).to.eventually.be.fulfilled;
      });
    });

    describe('when server is properly configured', () => {
      it('returns the current configuration', () => {
        const p: any = new Pact(fullOpts);

        p.server = serverMock;

        return expect(p.setup()).to.eventually.include({
          consumer: 'A',
          provider: 'B',
          port: 1234,
          host: '127.0.0.1',
          ssl: false,
          logLevel: 'info',
          spec: 2,
          cors: false,
          pactfileWriteMode: 'overwrite',
        });
      });
    });
  });
});
