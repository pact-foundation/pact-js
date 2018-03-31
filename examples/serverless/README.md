# Serverless example

![serverless-logo](https://user-images.githubusercontent.com/53900/38163394-57ec9176-353f-11e8-80d1-b9f6d5f1773f.png)

Fictional application running using the [Serverless](https://github.com/serverless/serverless) framework.

The very basic architecture is as follows:

`[Event Provider]` -> `[SNS]` <- `[Event Consumer]`

## Overview
<!-- TOC -->

- [Overview](#overview)
- [Test Services with Pact](#test-services-with-pact)
- [Deployment](#deployment)
  - [Pact Broker integration](#pact-broker-integration)
  - [Running deployment](#running-deployment)
- [Running](#running)
- [Further reading](#further-reading)

<!-- /TOC -->

**Message Producer**

Small utility that when invoked, publishes an "event" message to an SQS queue.

**Message Consumer**

Lambda function that reads from SQS and processes the data - by incrementing a simple counter.

## Test Services with Pact

To run both the consumer and provider pact tests:

```
npm t
```

Or individually:

```
npm run test:consumer
npm run test:provider
```

## Deployment

### Pact Broker integration

Using the test broker at https://test.pact.dius.com.au (user/pass: `dXfltyFMgNOFZAxr8io9wJ37iUpY42M` / `O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`), we integrate the `can-i-deploy` facility, that ensure it is safe to deploy the consumer or provider before a change.

Whenever we verify a contract with Pact, the results are shared with the broker, which is able to determine compatibility between components.

You can see the current state of verification by running one of:

```
npm run can-i-deploy:consumer
npm run can-i-deploy:provider
```

### Running deployment

Ensure you have valid AWS credentials in your environment and have installed serverless framework (`npm i -g serverless`), and then run;

```sh
npm run deploy
```

This will first check with `can-i-deploy`. If you want to skip this process, you can simply run:

```
serverless deploy -f provider
serverless deploy -f consumer
```

## Running

**Invoking the provider**

```sh
serverless invoke -f provider -l
```

**Watching the consumer**
```sh
serverless logs -f consumer -t
```

## Further reading

For further reading and introduction into the topic of asynchronous services contract testing, see this [article](https://dius.com.au/2017/09/22/contract-testing-serverless-and-asynchronous-applications/)
and our other [example](https://github.com/pact-foundation/pact-js/tree/master/examples/messages) for a more detailed overview of these concepts.
