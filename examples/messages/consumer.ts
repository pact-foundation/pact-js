/** An order event published when a new order is placed. */
export interface OrderPlacedEvent {
  orderId: string;
  customerId: string;
  totalAmount: number;
  currency: string;
  items: Array<{ productId: string; quantity: number }>;
}

/**
 * Handles an incoming OrderPlaced event.
 *
 * This is the consumer's message handler — the function that processes
 * events received from the message queue (SQS, Kafka, RabbitMQ, etc.).
 *
 * In Pact message tests, this function is called with the mock event body
 * to verify the consumer can correctly handle messages published by the
 * provider. The handler must not throw for a valid message.
 *
 * @throws {Error} when required fields are missing, signalling the consumer
 *   cannot process the event and the contract has been violated.
 */
export function handleOrderPlacedEvent(event: OrderPlacedEvent): void {
  if (!event.orderId) throw new Error('orderId is required');
  if (!event.customerId) throw new Error('customerId is required');
  if (event.totalAmount <= 0) throw new Error('totalAmount must be positive');
  if (!event.currency) throw new Error('currency is required');
  if (!event.items?.length) throw new Error('items must not be empty');

  // In production: persist the order, update inventory, send confirmation, etc.
}
