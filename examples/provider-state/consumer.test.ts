/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: ${...} is used internally by Pact */
import path from 'node:path';
import { type LogLevel, Matchers, PactV3 } from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';
import { AccountServiceClient } from './consumer';

const { integer, string, fromProviderState } = Matchers;

/**
 * Consumer Pact tests for the Account Service, demonstrating provider states.
 *
 * Provider states serve two purposes:
 * 1. Simple states ("an account exists") — tell the provider to create the
 *    precondition before verifying this interaction.
 * 2. Parameterised states ("an account with number {accountNumber} exists") —
 *    pass data from the consumer to the provider's state handler, enabling
 *    the handler to set up the exact data the interaction needs.
 *
 * `fromProviderState()` handles response values that the provider generates
 * during state setup (e.g. a database auto-increment ID). The consumer
 * defines a fallback example value for the mock; the provider substitutes the
 * real generated value during verification.
 */
describe('AccountServiceClient', () => {
  const pact = new PactV3({
    consumer: 'AccountConsumer',
    provider: 'AccountService',
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
  });

  it('fetches an account by account number — parameterised state + fromProviderState()', async () => {
    pact
      .given(
        // Parameterised state: the account number is passed to the provider's
        // state handler so it can seed exactly the account this interaction needs.
        'an account with number {accountNumber} exists',
        { accountNumber: 'ACC-001' },
      )
      .uponReceiving('a GET request for account ACC-001')
      .withRequest({
        method: 'GET',
        path: '/accounts/ACC-001',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          // fromProviderState(): the provider generates this value during state
          // setup (e.g. a database auto-increment). The consumer provides an
          // example value for the mock response; the real value is substituted
          // during provider verification via the state handler's return value.
          id: fromProviderState('${accountId}', 42),
          accountNumber: string('ACC-001'),
          ownerName: string('Jane Smith'),
          balance: integer(1000),
        },
      });

    return pact.executeTest(async (mockserver) => {
      const client = new AccountServiceClient(mockserver.url);
      const account = await client.getAccountByNumber('ACC-001');
      // The mock returns the example value (42); the provider may return
      // a different integer (e.g. 17) — the contract only checks the type.
      expect(typeof account.id).toBe('number');
      expect(account.accountNumber).toBe('ACC-001');
    });
  });
});
