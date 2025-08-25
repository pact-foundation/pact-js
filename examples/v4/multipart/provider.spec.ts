import { LogLevel, Verifier } from '@pact-foundation/pact';
import { after } from 'mocha';

const express = require('express');
const server = express();
const multer = require('multer');
const upload = multer({ dest: './uploads/' });

server.use((_, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
});

server.post('/multipart', upload.single('file.txt'), (req, res) => {
  if (req.file.originalname !== 'README.md') {
    res.status(500).json({ success: false });
    return;
  }

  res.status(200).json({ success: true });
});

const app = server.listen(8080, () => {
  console.log('API listening on http://localhost:8080');
});

describe('V4 Matchers', () => {
  describe('eachKeyLike', () => {
    const pact = new Verifier({
      pactUrls: ['./pacts/multipartconsumer-multipartprovider.json'],
      providerBaseUrl: 'http://localhost:8080',
      logLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
    });
    it('verifies the pact', () => pact.verifyProvider());
  });

  after(() => {
    app.close();
  });
});
