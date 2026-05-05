import path from 'node:path';
import {
  type LogLevel,
  Matchers,
  Pact,
  v4SynchronousBodyHandler,
} from '@pact-foundation/pact';
import { describe, it } from 'vitest';
import { handleOrderPlacedEvent } from './consumer';

const { string, decimal, integer } = Matchers;

/**
 * Consumer Pact tests for async OrderPlaced events.
 *
 * Message pacts differ from HTTP pacts: there is no mock server. Instead,
 * Pact generates a mock message body and passes it directly to your handler
 * function. The test verifies that the handler can process valid messages
 * without throwing.
 *
 * The pact file records the expected message shape. The provider verifies
 * it can produce messages that match this shape (see provider.test.ts).
 *
 * This pattern applies to any message-based system: Kafka, SQS, RabbitMQ,
 * EventBridge, SNS, or even WebSockets. The transport is irrelevant — only
 * the message body shape is contracted.
 */
describe('handleOrderPlacedEvent', () => {
  const pact = new Pact({
    consumer: 'OrderConsumer',
    provider: 'OrderProvider',
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
  });

  it('handles a valid OrderPlaced event', () => {
    return (
      pact
        .addAsynchronousInteraction()
        .given('an order has been placed')
        .expectsToReceive('an OrderPlaced event', (builder) => {
          builder
            .withJSONContent({
              // like() on the whole body: any object with these fields and types.
              orderId: string('order-123'),
              customerId: string('customer-456'),
              // decimal(): any positive floating-point number
              totalAmount: decimal(99.99),
              // regex(): ISO 4217 currency code (3 uppercase letters)
              currency: Matchers.regex(/^[A-Z]{3}$/, 'USD'),
              // eachLike(): array of order items, each with productId and quantity
              items: Matchers.eachLike({
                productId: string('prod-789'),
                quantity: integer(2),
              }),
            })
            // Metadata travels alongside the message body (queue name, headers, etc.)
            // and is also contracted. The provider must publish to the same queue.
            .withMetadata({
              queue: 'orders.placed',
              contentType: 'application/json',
            });
        })
        // v4SynchronousBodyHandler wraps your handler: it passes the message body
        // to it, and the test passes if the handler does not throw.
        .executeTest(
          v4SynchronousBodyHandler(
            handleOrderPlacedEvent as (body: unknown) => void,
          ),
        )
    );
  });
});
