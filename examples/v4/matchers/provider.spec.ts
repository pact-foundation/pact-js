import { Verifier } from '@pact-foundation/pact';
import { after } from 'mocha';

const express = require('express');
const server = express();

server.use((_, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
});

server.get('/status', (req, res) => {
  res.send(202);
});

server.get('/eachKeyMatches', (req, res) => {
  res.json({
    // '1': 'foo', // <- fails, is a number
    // 'not valid': '1', // <- fails, is a string but does not match regex (has space)
    // key: 'value', // <- fails, key does not match regex (no trailing number)
    key1: 'value',
    key2: 'value',
  });
});

server.get('/eachValueMatches', (req, res) => {
  res.json({
    // foo: 1,   // <- fails, is a number
    // foo: '1', // <- fails, is a string but does not match regex
    for: 'string with space',
  });
});

const app = server.listen(8080, () => {
  console.log('API listening on http://localhost:8080');
});

describe('V4 Matchers', () => {
  describe('eachKeyLike', () => {
    const pact = new Verifier({
      pactUrls: ['./pacts/myconsumer-myprovider.json'],
      providerBaseUrl: 'http://localhost:8080',
      logLevel: 'trace',
    });
    it('verifies the pact', () => pact.verifyProvider());
  });

  after(() => {
    app.close();
  });
});
