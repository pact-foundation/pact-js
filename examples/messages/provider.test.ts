import path from 'node:path';
import {
  type LogLevel,
  MessageProviderPact,
  providerWithMetadata,
} from '@pact-foundation/pact';
import { describe, it } from 'vitest';
import { createOrderPlacedEvent } from './provider';

/**
 * Provider-side Pact verification for async messages.
 *
 * `MessageProviderPact` is the message equivalent of `Verifier`. Instead of
 * making HTTP requests, it calls the `messageProviders` functions and checks
 * that the returned message body matches the consumer's contracted shape.
 *
 * Each key in `messageProviders` must match an interaction description from
 * the consumer's pact file exactly (the string passed to `expectsToReceive()`).
 */
describe('OrderProvider — messages', () => {
  it('satisfies all OrderConsumer message expectations', () => {
    const p = new MessageProviderPact({
      // Point at the local pact file. In a team workflow this would be a
      // Pact Broker URL; see the Further Reading section in README.md.
      pactUrls: [
        path.resolve(process.cwd(), 'pacts/OrderConsumer-OrderProvider.json'),
      ],
      messageProviders: {
        // The key must match the description string from expectsToReceive()
        'an OrderPlaced event': providerWithMetadata(
          () => createOrderPlacedEvent('order-999'),
          { queue: 'orders.placed', contentType: 'application/json' },
        ),
      },
      stateHandlers: {
        'an order has been placed': async () => {
          /* seed provider state if needed */
        },
      },
      logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
    });
    return p.verify();
  }, 30_000);
});
