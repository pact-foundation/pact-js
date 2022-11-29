/* tslint:disable:no-unused-expression no-empty */
import net = require('net');
import express = require('express');
import * as http from 'http';
import { generateMattMessage, parseMattMessage } from './protocol';

export const startTCPServer = (host: string, port: number) => {
  const server = net.createServer();

  server.on('connection', (sock) => {
    sock.on('error', (err) => {
      console.log(`received TCP socket error: ${err}. Error will be ignored`);
    });
    sock.on('data', (data) => {
      const msg = parseMattMessage(data.toString());

      if (msg === 'hellotcp') {
        sock.write(generateMattMessage('tcpworld'));
      } else {
        sock.write(generateMattMessage('message not understood'));
      }
      sock.write('\n');
      sock.end();
    });
  });

  return new Promise((resolve) => {
    server.listen(port, host);

    server.on('error', (err) => {
      console.log(`received TCP server error: ${err}. Error will be ignored`);
    });

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

  server.on('error', (err) => {
    console.log(`received HTTP error: ${err}. Error will be ignored`);
  });

  let s: http.Server;
  return new Promise<void>((resolve) => {
    s = server.listen(port, host, () => {
      resolve();
    });
  }).then(() => s);
};
