import * as http from 'http';

interface ReqBodyExtended extends http.IncomingMessage {
  body?: Buffer | Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseBody = (
  proxyReq: http.ClientRequest,
  req: ReqBodyExtended
): void => {
  if (!req.body || !Object.keys(req.body).length) {
    return;
  }

  let bodyData;

  if (Buffer.isBuffer(req.body)) {
    bodyData = req.body;
  } else if (typeof req.body === 'object') {
    bodyData = JSON.stringify(req.body);
  }

  if (bodyData) {
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
};
