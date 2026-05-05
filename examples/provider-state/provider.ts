import express, { type Express } from 'express';

type Account = {
  id: number;
  accountNumber: string;
  ownerName: string;
  balance: number;
};

// In-memory store keyed by account number.
const accounts = new Map<string, Account>();
let nextId = 1;

/**
 * Creates the Account Service Express application.
 *
 * Routes look up accounts by account number (not by internal ID).
 * Internal IDs are assigned when accounts are seeded by state handlers,
 * mirroring how a real database would assign auto-increment IDs.
 */
export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/accounts/:accountNumber', (req, res) => {
    const account = accounts.get(req.params.accountNumber);
    account
      ? res.json(account)
      : res.status(404).json({ error: 'Account not found' });
  });

  return app;
}

/**
 * Seed an account and return its generated ID.
 *
 * Called by provider state handlers. The returned ID is passed back to Pact
 * as the `accountId` generator value, satisfying `fromProviderState('${accountId}', ...)`.
 */
export function seedAccount(accountNumber: string, ownerName: string): number {
  const id = nextId++;
  accounts.set(accountNumber, { id, accountNumber, ownerName, balance: 1000 });
  return id;
}

/** Reset all accounts and ID counter between runs. */
export function clearAccounts(): void {
  accounts.clear();
  nextId = 1;
}
