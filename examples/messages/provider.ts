import type { OrderPlacedEvent } from './consumer';

/**
 * Creates an OrderPlaced event for a given order ID.
 *
 * This is the provider's message factory — the function that constructs
 * messages before publishing them to the queue.
 *
 * In Pact provider verification, this function is called instead of the real
 * queue publisher. Its return value is compared against the consumer's
 * contracted message shape.
 */
export function createOrderPlacedEvent(orderId: string): OrderPlacedEvent {
  return {
    orderId,
    customerId: 'customer-001',
    totalAmount: 149.95,
    currency: 'GBP',
    items: [
      { productId: 'prod-a', quantity: 1 },
      { productId: 'prod-b', quantity: 3 },
    ],
  };
}
