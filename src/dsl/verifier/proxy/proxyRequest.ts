import type { IncomingMessage } from 'node:http';
import { Readable } from 'node:stream';
import type { ServerOptions } from 'http-proxy';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { parseBody } from './parseBody';
import type { ProxyOptions } from './types';

// A base URL is always needed for the proxy, even
// if there are no targets to proxy (e.g. in the case
// of message pact
const defaultBaseURL = () => 'http://127.0.0.1/';

export const toServerOptions = (
  config: ProxyOptions,
  req: IncomingMessage,
): ServerOptions => {
  // Provide direct support for standard proxy configuration
  const systemProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

  return {
    changeOrigin: config.changeOrigin === true,
    secure: config.validateSSL === true,
    target: config.providerBaseUrl || defaultBaseURL(),
    agent: systemProxy && new HttpsProxyAgent(systemProxy),
    buffer: Readable.from(parseBody(req)),
  };
};
