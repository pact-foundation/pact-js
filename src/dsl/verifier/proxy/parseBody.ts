import http from 'http';

interface ReqBodyExtended extends http.IncomingMessage {
  body?: Buffer | Record<string, unknown>;
}

export const parseBody = (req: ReqBodyExtended): Buffer => {
  let bodyData = Buffer.alloc(0);

  if (!req.body || !Object.keys(req.body).length) {
    return bodyData;
  }

  if (Buffer.isBuffer(req.body)) {
    bodyData = req.body;
  } else if (typeof req.body === 'object') {
    bodyData = Buffer.from(JSON.stringify(req.body));
  }

  return bodyData;
};
