import express, { type Express } from 'express';

export type ProviderOptions = {
  /**
   * When true the provider deliberately violates the contracts:
   * GET /two answers 500 and GET /three answers with a wrong body type.
   * Used only to capture failure fixtures, never by the regular tests.
   */
  failing?: boolean;
};

// Provider state: "resource three is available" toggles this flag.
let resourceThreeAvailable = false;

export function makeResourceThreeAvailable(): void {
  resourceThreeAvailable = true;
}

export function resetProviderState(): void {
  resourceThreeAvailable = false;
}

/**
 * Creates the DemoProvider Express application.
 *
 * GET /one and GET /two always answer `{ ok: true }`.
 * GET /three answers 404 unless the provider state handler made it available.
 */
export function createApp(options: ProviderOptions = {}): Express {
  const app = express();

  app.get('/one', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/two', (_req, res) => {
    if (options.failing) {
      res.status(500).json({ error: 'deliberate failure' });
      return;
    }
    res.json({ ok: true });
  });

  app.get('/three', (_req, res) => {
    if (!resourceThreeAvailable) {
      res.status(404).json({ error: 'resource three not available' });
      return;
    }
    // In failing mode the body has the wrong type (string instead of boolean).
    res.json({ ok: options.failing ? 'true' : true });
  });

  return app;
}
