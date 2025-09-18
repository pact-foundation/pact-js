# Event driven-systems

## Introduction to Message Based API Testing

Modern distributed architectures are increasingly integrated in a decoupled, asynchronous fashion. Message queues such as ActiveMQ, RabbitMQ, SQS, Kafka and Kinesis are common, often integrated via small and frequent numbers of microservices (e.g. lambda).

Furthermore, the web has things like WebSockets and gRPC which involve bidirectional messaging (synchronous).

Pact has support for these use cases, by abstracting away the protocol and focussing on the messages passing between them.

[Read the docs](https://docs.pact.io/getting_started/how_pact_works#non-http-testing-message-pact) for more on how Pact deals with this.


Pact is a consumer-driven contract testing tool, which is a fancy way of saying that the API `Consumer` writes a test to set out its assumptions and needs of its API `Provider`(s). By unit testing our API client with Pact, it will produce a `contract` that we can share to our `Provider` to confirm these assumptions and prevent breaking changes.

The process looks like this on the consumer side:

![diagram](https://raw.githubusercontent.com/pact-foundation/pact-js/master/docs/diagrams/message-consumer.png)

The process looks like this on the provider (producer) side:

![diagram](https://raw.githubusercontent.com/pact-foundation/pact-js/master/docs/diagrams/message-provider.png)

1. The consumer writes a unit test of its behaviour using a Mock provided by Pact.
1. Pact writes the interactions into a contract file (as a JSON document).
1. The consumer publishes the contract to a broker (or shares the file in some other way).
1. Pact retrieves the contracts and replays the requests against a locally running provider.
1. The provider should stub out its dependencies during a Pact test, to ensure tests are fast and more deterministic.

In this document, we will cover steps 1 and 2.

## Contract Testing Process (Asynchronous)

### Consumer

A Consumer is the system that will be reading a message from a queue or some other intermediary - like a DynamoDB table or S3 bucket - and be able to handle it.

From a Pact testing point of view, Pact takes the place of the intermediary (MQ/broker etc.) and confirms whether or not the consumer is able to handle a request.

The following test creates a contract for a Dog API handler:

```js
import {
  Matchers,
  v4SynchronousBodyHandler,
  LogLevel,
  Pact,
} from '@pact-foundation/pact';
const { like, regex } = Matchers;
const path = require('path');
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

// 1 Dog API Handler
export type Dog = {
  id: string;
  type: string;
  name: string;
};

// This is your message handler function.
// It expects to receive a valid "dog" object
// and returns a failed promise if not
export function dogApiHandler(dog: Dog): void {
  if (!dog.id || !dog.name || !dog.type) {
    throw new Error('missing fields');
  }

  // do some other things to dog...
  // e.g. dogRepository.save(dog)
  return;
}

describe('Message consumer tests', () => {
  // 2 Pact Message Consumer
  const messagePact = new Pact({
    consumer: 'MyJSMessageConsumerV4',
    provider: 'MyJSMessageProviderV4',
    logLevel: LOG_LEVEL as LogLevel,
  });

  describe('receive dog event', () => {
    it('accepts a valid dog', () => {
      // 3 Consumer expectations
      return messagePact
        .addAsynchronousInteraction()
        .given('a dog named drover')
        .expectsToReceive('a request for a dog', (builder: any) => {
          builder
            .withJSONContent({
              id: like(1),
              name: like('drover'),
              type: regex('^(bulldog|sheepdog)$','bulldog'),
            })
            .withMetadata({
              queue: 'animals',
            });
        })
        // 4 Verify consumers' ability to handle messages
        .executeTest(v4SynchronousBodyHandler(dogApiHandler));
    });
  });

  // This is an example of a pact breaking
  // unskip to see how it works!
  it.skip('Does not accept an invalid dog', () => {
    return messagePact
      .addAsynchronousInteraction()
      .given('some state')
      .expectsToReceive('a request for a dog', (builder: any) => {
        builder
          .withJSONContent({
            name: like('fido'),
          })
          .withMetadata({
            queue: 'animals',
          });
      })
      .executeTest(v4SynchronousBodyHandler(dogApiHandler));
  });
});

```

**Explanation**:

1.  The Dog API - a contrived API handler example. Expects a dog object and throws an `Error` if it can't handle it.
    - In most applications, some form of transactionality exists and communication with a MQ/broker happens.
    - It's important we separate out the protocol bits from the message handling bits, so that we can test that in isolation.
1.  Creates the MessageConsumer class.
1.  Setup the expectations for the consumer - here we expect a `dog` object with three fields.
1.  Pact will send the message to your message handler. If the handler returns a successful promise, the message is saved, otherwise the test fails. There are a few key things to consider:
    - The actual request body that Pact will send, will be contained within a [Message](https://github.com/pact-foundation/pact-js/tree/master/src/dsl/message.ts) object along with other context, so the body must be retrieved via `content` attribute.
    - All handlers to be tested must be of the shape `(m: Message) => Promise<any>` - that is, they must accept a `Message` and return a `Promise`. This is how we get around all of the various protocols, and will often require a lightweight adapter function to convert it.
    - In this case, we wrap the actual dogApiHandler with a convenience function `synchronousBodyHandler` provided by Pact, which Promisifies the handler and extracts the contents.

### Provider (Producer)

A Provider (Producer in messaging parlance) is the system that will be putting a message onto the queue.

As per the Consumer case, Pact takes the position of the intermediary (MQ/broker) and checks to see whether or not the Provider sends a message that matches the Consumer's expectations.

```js
const path = require("path")
const { MessageProviderPact, providerWithMetadata } = require("@pact-foundation/pact");

// 1 Messaging integration client
const dogApiClient = {
  createDog: () => {
    return new Promise((resolve, reject) => {
      resolve({
        id: 1,
        name: "fido",
        type: "bulldog",
      })
    })
  },
}

describe("Message provider tests", () => {
  // 2 Pact setup
  const p = new MessageProviderPact({
    messageProviders: {
      'a request for a dog': providerWithMetadata(() => createDog(27), {
        queue: 'animals',
      }),
    },
    provider: "MyJSMessageProvider",
    providerVersion: "1.0.0",
    pactUrls: [
      path.resolve(
        process.cwd(),
        "pacts",
        "myjsmessageconsumer-myjsmessageprovider.json"
      ),
    ],
  })

  // 3 Verify the interactions
  describe("Dog API Client", () => {
    it("sends some dogs", () => {
      return p.verify()
    })
  })
})
```

**Explanation**:

1.  Our API producer contains a single function `createDog` which is responsible for generating the message that will be sent to the consumer via some message queue.
1.  We configure Pact to stand-in for the queue. The most important bit here is the `messageProviders` block.
    - Similar to the Consumer tests, we map the various interactions that are going to be verified as denoted by their `description` field. In this case, `a request for a dog`, maps to the `createDog` handler. Notice how this matches the original Consumer test. We are using the `providerWithMetadata` function because we are also going to validate message metadata (in this case, the queue the message will be sent on).
1.  We can now run the verification process. Pact will read all of the interactions specified by its consumer, and invoke each function that is responsible for generating that message.

## Contract Testing Process (Synchronous)

