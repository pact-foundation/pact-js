import express, { type Express } from 'express';

type User = { id: number; name: string; email: string };

// In-memory user store. Populated by provider state handlers during Pact
// verification. In a real application, this would be a database or external
// service whose calls are mocked during testing.
const users = new Map<number, User>();

/**
 * Creates the User Service Express application.
 *
 * Exported so the provider verification test can start it on a known port.
 * In a real application, this would connect to a database; here we use an
 * in-memory map so the example has no external dependencies.
 */
export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/users', (_req, res) => {
    res.json([...users.values()]);
  });

  app.get('/users/:id', (req, res) => {
    const user = users.get(Number(req.params.id));
    user ? res.json(user) : res.status(404).json({ error: 'User not found' });
  });

  return app;
}

/**
 * Seed a user into the in-memory store.
 * Called by provider state handlers to set up preconditions before
 * each interaction is verified.
 */
export function seedUser(user: User): void {
  users.set(user.id, user);
}

/** Remove all seeded users. Called between verification runs. */
export function clearUsers(): void {
  users.clear();
}
