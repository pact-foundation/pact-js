import chai from 'chai';
import { Readable } from 'stream';
import { ProxyOptions } from './types';
import { toServerOptions as toServerOptionsAct } from './proxyRequest';

const { expect } = chai;

describe('#toServerOptions', () => {
  const toServerOptions = (opts: ProxyOptions = {}, req?: { body: any }) =>
    toServerOptionsAct(opts, req ?? ({} as any));

  context('changeOrigin', () => {
    it('forwards option', () => {
      const res = toServerOptions({ changeOrigin: true });

      expect(res.changeOrigin).to.be.true;
    });

    it('is false by default', () => {
      const res = toServerOptions();

      expect(res.changeOrigin).to.be.false;
    });
  });

  context('secure', () => {
    it('is true when validating ssl', () => {
      const res = toServerOptions({ validateSSL: true });

      expect(res.secure).to.be.true;
    });

    it('is false by default', () => {
      const res = toServerOptions();

      expect(res.secure).to.be.false;
    });
  });

  context('target', () => {
    it('uses providerBaseUrl', () => {
      const expectedTarget = 'http://test.com';

      const res = toServerOptions({ providerBaseUrl: expectedTarget });

      expect(res.target).to.eq(expectedTarget);
    });

    it('uses loopback address by default', () => {
      const res = toServerOptions();

      expect(res.target).to.eq('http://127.0.0.1/');
    });
  });

  context('agent', () => {
    const initialEnv = { ...process.env };

    afterEach(() => {
      process.env = { ...initialEnv };
    });

    it('uses no agent by default', () => {
      const res = toServerOptions();

      expect(res.agent).to.be.undefined;
    });

    it('uses HTTPS_PROXY', () => {
      const expectedProxy = 'http://proxy.host/';
      process.env.HTTPS_PROXY = expectedProxy;

      const res = toServerOptions();

      expect(res.agent?.proxy?.toString()).to.eq(expectedProxy);
    });

    it('uses HTTP_PROXY', () => {
      const expectedProxy = 'http://my.proxy/';
      process.env.HTTP_PROXY = expectedProxy;

      const res = toServerOptions();

      expect(res.agent?.proxy?.toString()).to.eq(expectedProxy);
    });

    it('prefers HTTPS_PROXY to HTTP_PROXY', () => {
      process.env.HTTPS_PROXY = 'http://unused/';
      const expectedProxy = 'http://expected.proxy/';
      process.env.HTTPS_PROXY = expectedProxy;

      const res = toServerOptions();

      expect(res.agent?.proxy?.toString()).to.eq(expectedProxy);
    });
  });

  context('buffer', () => {
    it('provides readable of body', () => {
      const res = toServerOptions({}, { body: 'a' });

      expect(res.buffer).to.be.instanceOf(Readable);
    });

    it('provides readable when body is undefined', () => {
      const res = toServerOptions();

      expect(res.buffer).to.be.instanceOf(Readable);
    });
  });
});
