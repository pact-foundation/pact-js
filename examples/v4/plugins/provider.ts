/* tslint:disable:no-unused-expression no-empty */
import net = require('net');
import express = require('express');
import * as http from 'http';
import { generateMattMessage, parseMattMessage } from './protocol';

export const startTCPServer = (host: string, port: number) => {
  const server = net.createServer();

  server.on('connection', (sock) => {
    sock.on('data', (data) => {
      const msg = parseMattMessage(data.toString());

      if (msg === 'hellotcp') {
        sock.write(generateMattMessage('tcpworld'));
      } else {
        sock.write(generateMattMessage('message not understood'));
      }
      sock.write('\n');
    });
  });

  return new Promise((resolve) => {
    server.listen(port, host);

    server.on('listening', () => {
      resolve(null);
    });
  });
};

export const startHTTPServer = (
  host: string,
  port: number
): Promise<http.Server> => {
  const server: express.Express = express();

  server.post('/matt', (_, res) => {
    res.setHeader('content-type', 'application/matt');
    res.send(generateMattMessage('world'));
  });

  let s: http.Server;
  return new Promise<void>((resolve) => {
    s = server.listen(port, host, () => {
      resolve();
    });
  }).then(() => s);
};
