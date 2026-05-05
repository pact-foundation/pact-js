import express, { type Express } from 'express';
import { generateMattMessage, parseMattMessage } from './protocol';

/**
 * Creates the MATT service Express application.
 *
 * Parses the incoming MATT-encoded body, echoes back a MATT-encoded response.
 * For payload "hello" → response "world" (hardcoded for the example).
 */
export function createApp(): Express {
  const app = express();

  app.use((req, _res, next) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      (req as express.Request & { rawBody: string }).rawBody = body;
      next();
    });
  });

  app.post('/matt', (req, res) => {
    const raw = (req as express.Request & { rawBody: string }).rawBody;
    const payload = parseMattMessage(raw);
    const response = payload === 'hello' ? 'world' : 'unknown';
    res.setHeader('content-type', 'application/matt');
    res.send(generateMattMessage(response));
  });

  return app;
}
