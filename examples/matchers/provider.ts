import express, { type Express } from 'express';

/**
 * Creates the Product API Express application for the matchers example.
 *
 * The values returned here are intentionally DIFFERENT from the consumer's
 * example values. This proves the point: matchers check types and structure,
 * not specific values. The consumer expected `id: 1`, the provider returns
 * `id: 99` — the contract still passes because `integer()` only checks type.
 *
 * Category returns 'gadgets' rather than 'electronics' — both match /^[a-z-]+$/.
 * Price returns 14.50 rather than 9.99 — both match decimal().
 * Tags returns two elements rather than one — eachLike() only requires ≥1.
 */
export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/products/:id', (_req, res) => {
    res.json({
      id: 99, // different from consumer's example (1)
      name: 'Gadget Pro', // different from 'Widget'
      price: 14.5, // different from 9.99
      category: 'gadgets', // matches /^[a-z-]+$/
      createdAt: '2025-06-15T12:00:00.000Z', // valid datetime format
      tags: ['featured', 'sale'], // two elements, not one
    });
  });

  app.get('/products', (_req, res) => {
    res.json([
      { id: 10, name: 'Alpha', price: 1.5 },
      { id: 11, name: 'Beta', price: 2.5 },
      { id: 12, name: 'Gamma', price: 3.5 },
    ]);
  });

  app.get('/catalog', (_req, res) => {
    res.json({
      'ALPHA-001': { name: 'Alpha Device', price: 99.99 },
      'BETA-002': { name: 'Beta Gadget', price: 149.99 },
    });
  });

  return app;
}
