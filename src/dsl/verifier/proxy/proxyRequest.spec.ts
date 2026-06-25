import { Readable } from 'node:stream';
import type { HttpsProxyAgent } from 'https-proxy-agent';
import { toServerOptions as toServerOptionsAct } from './proxyRequest';
import type { ProxyOptions } from './types';

describe('#toServerOptions', () => {
  const toServerOptions = (opts: ProxyOptions = {}, req?: { body: unknown }) =>
    // biome-ignore lint/suspicious/noExplicitAny: minimal request mock object to satisfy the type parameter
    toServerOptionsAct(opts, req ?? ({} as any));

  describe('changeOrigin', () => {
    it('forwards option', () => {
      const res = toServerOptions({ changeOrigin: true });

      expect(res.changeOrigin).toBe(true);
    });

    it('is false by default', () => {
      const res = toServerOptions();

      expect(res.changeOrigin).toBe(false);
    });
  });

  describe('secure', () => {
    it('is true when validating ssl', () => {
      const res = toServerOptions({ validateSSL: true });

      expect(res.secure).toBe(true);
    });

    it('is false by default', () => {
      const res = toServerOptions();

      expect(res.secure).toBe(false);
    });
  });

  describe('target', () => {
    it('uses providerBaseUrl', () => {
      const expectedTarget = 'http://test.com';

      const res = toServerOptions({ providerBaseUrl: expectedTarget });

      expect(res.target).toBe(expectedTarget);
    });

    it('uses loopback address by default', () => {
      const res = toServerOptions();

      expect(res.target).toBe('http://127.0.0.1/');
    });
  });

  describe('agent', () => {
    const initialEnv = { ...process.env };

    afterEach(() => {
      process.env = { ...initialEnv };
    });

    it('uses no agent by default', () => {
      const res = toServerOptions();

      expect(res.agent).toBeUndefined();
    });

    it('uses HTTPS_PROXY', () => {
      const expectedProxy = 'http://proxy.host/';
      process.env.HTTPS_PROXY = expectedProxy;

      const res = toServerOptions();

      expect((res.agent as HttpsProxyAgent<string>)?.proxy?.toString()).toBe(
        expectedProxy,
      );
    });

    it('uses HTTP_PROXY', () => {
      const expectedProxy = 'http://my.proxy/';
      process.env.HTTP_PROXY = expectedProxy;

      const res = toServerOptions();

      expect((res.agent as HttpsProxyAgent<string>)?.proxy?.toString()).toBe(
        expectedProxy,
      );
    });

    it('prefers HTTPS_PROXY to HTTP_PROXY', () => {
      process.env.HTTP_PROXY = 'http://ignored.proxy/';
      const expectedProxy = 'http://expected.proxy/';
      process.env.HTTPS_PROXY = expectedProxy;

      const res = toServerOptions();

      expect((res.agent as HttpsProxyAgent<string>)?.proxy?.toString()).toBe(
        expectedProxy,
      );
    });
  });

  describe('buffer', () => {
    it('provides readable of body', () => {
      const res = toServerOptions({}, { body: 'a' });

      expect(res.buffer).toBeInstanceOf(Readable);
    });

    it('provides readable when body is undefined', () => {
      const res = toServerOptions();

      expect(res.buffer).toBeInstanceOf(Readable);
    });
  });
});
