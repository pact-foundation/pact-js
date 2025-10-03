# Message Pact examples

**Running**:

```
npm i
npm run test:consumer
npm run test:publish
npm run test:provider
```

## Asynchronous API Testing

Modern distributed architectures are increasingly integrated in a decoupled, asynchronous fashion. Message queues such as ActiveMQ, RabbitMQ, SQS, Kafka and Kinesis are common, often integrated via small and frequent numbers of microservices (e.g. lambda.).

Furthermore, the web has things like WebSockets which involve bidirectional messaging.

Pact now has experimental support for these use cases, by abstracting away the protocol and focussing on the messages passing between them.

For further reading and introduction into this topic, see this [article](https://dius.com.au/2017/09/22/contract-testing-serverless-and-asynchronous-applications/)
and our [example](https://github.com/pact-foundation/pact-js/tree/master/examples/messages) for a more detailed overview of these concepts.

_Since version `v6.0.0-alpha` or later_

### Consumer

A Consumer is the system that will be reading a message from a queue or some intermediary - like a DynamoDB table or S3 bucket -
and be able to handle it.

From a Pact testing point of view, Pact takes the place of the intermediary (MQ/broker etc.) and confirms whether or not the consumer is able to handle a request.

The following test creates a contract for a Dog API handler:

```js
  const { MessageConsumerPact, Message, synchronousBodyHandler } = require("@pact-foundation/pact");

  // 1 Dog API Handler
  const dogApiHandler = function(dog) {
    if (!dog.id && !dog.name && !dog.type) {
      throw new Error("missing fields");
    }

    // do some other things to dog...
    // e.g. dogRepository.save(dog)
    return;
  }

  // 2 Pact Message Consumer
  const messagePact = new MessageConsumerPact({
    consumer: "MyJSMessageConsumer",
    dir: path.resolve(process.cwd(), "pacts"),
    pactfileWriteMode: "update",
    provider: "MyJSMessageProvider",
  });

  describe("receive dog event", () => {
    it("accepts a valid dog", () => {

      // 3 Consumer expectations
      return messagePact
        .given("some state")
        .expectsToReceive("a request for a dog")
        .withContent({
          id: like(1),
          name: like("rover"),
          type: term({ generate: "bulldog", matcher: "^(bulldog|sheepdog)$" }),
        })
        .withMetadata({
          "content-type": "application/json",
        })

        // 4 Verify consumers' ability to handle messages
        .verify(synchronousBodyHandler(dogApiHandler))
    )
  })
})
```

**Explanation**:

1. The Dog API - a contrived API handler example. Expects a dog object and throws an `Error` if it can't handle it.
   - In most applications, some form of transactionality exists and communication with a MQ/broker happens.
   - It's important we separate out the protocol bits from the message handling bits, so that we can test that in isolation.
1. Creates the MessageConsumer class
1. Setup the expectations for the consumer - here we expect a `dog` object with three fields
1. Pact will send the message to your message handler. If the handler returns a successful promise, the message is saved, otherwise the test fails. There are a few key things to consider:
   - The actual request body that Pact will send, will be contained within a [Message](../../src/dsl/message.ts) object along with other context, so the body must be retrieved via `content` attribute.
   - All handlers to be tested must be of the shape `(m: Message) => Promise<any>` - that is, they must accept a `Message` and return a `Promise`. This is how we get around all of the various protocols, and will often require a lightweight adapter function to convert it.
   - In this case, we wrap the actual dogApiHandler with a convenience function `synchronousBodyHandler` provided by Pact, which Promisifies the handler and extracts the contents.

### Provider (Producer)

A Provider (Producer in messaging parlance) is the system that will be putting a message onto the queue.

As per the Consumer case, Pact takes the position of the intermediary (MQ/broker) and checks to see whether or not the Provider sends a message that matches the Consumer's expectations.

```js
const { MessageProviderPact, Message } = require("@pact-foundation/pact")

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
      "a request for a dog": () => dogApiClient.createDog(),
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
    it("sends a valid dog", () => {
      return p.verify()
    })
  })
})
```

**Explanation**:

1. Our API client contains a single function `createDog` which is responsible for generating the message that will be sent to the consumer via some message queue
1. We configure Pact to stand-in for the queue. The most important bit here is the `handlers` block
   - Similar to the Consumer tests, we map the various interactions that are going to be verified as denoted by their `description` field. In this case, `a request for a dog`, maps to the `createDog` handler. Notice how this matches the original Consumer test.
1. We can now run the verification process. Pact will read all of the interactions specified by its consumer, and invoke each function that is responsible for generating that message.
