# Messages Example

This example demonstrates consumer-driven contract testing for asynchronous, event-driven systems — queues, event buses, pub/sub topics. No HTTP server is involved; Pact contracts the message *body shape* and metadata.

## What You'll Learn

- Using `addAsynchronousInteraction()` to define a message contract
- `v4SynchronousBodyHandler()` to wrap a message handler for Pact testing
- `MessageProviderPact` and `messageProviders` for provider verification
- `providerWithMetadata()` to contract message metadata (queue name, headers)

## Running the Example

```bash
npm install
npm test
```

## How It Works

**Consumer** (`consumer.ts`) exports `handleOrderPlacedEvent`, a function that processes `OrderPlaced` events received from a queue. The consumer test calls `addAsynchronousInteraction()` to define the expected event shape, then wraps the handler with `v4SynchronousBodyHandler()`. Pact generates a mock message body and passes it to the handler — if it doesn't throw, the contract is satisfied.

**Provider** (`provider.ts`) exports `createOrderPlacedEvent`, which builds an `OrderPlaced` event ready to publish. The provider test uses `MessageProviderPact` and `messageProviders` to tell Pact: "when you need an 'OrderPlaced event', call this function and check what it returns". Pact compares the return value against the consumer's contracted shape.

The transport layer (SQS, Kafka, RabbitMQ, SNS) is entirely absent from both tests. Pact contracts the shape of the data, not how it moves.

**v2/v3 migration note:** In v2/v3, message pacts used `MessageConsumerPact` and `MessageProviderPact` as separate classes. In v4, `Pact` handles both HTTP and message interactions — `addAsynchronousInteraction()` is the message API.

## Further Reading

- [Message pacts](https://docs.pact.io/implementation_guides/javascript/docs/messages)
