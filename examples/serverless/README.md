# Serverless example

![serverless-logo](https://user-images.githubusercontent.com/53900/38163394-57ec9176-353f-11e8-80d1-b9f6d5f1773f.png)

Sample contract testing application running using the [Serverless](https://github.com/serverless/serverless) framework.

The very basic architecture is as follows:

`[Event Provider]` -> `[SNS]` <- `[Event Consumer]`

## Overview
<!-- TOC -->

- [Serverless example](#serverless-example)
  - [Overview](#overview)
  - [Test Services with Pact](#test-services-with-pact)
  - [Deployment](#deployment)
    - [Pact Broker integration](#pact-broker-integration)
    - [Running deployment](#running-deployment)
  - [Running](#running)
  - [Cleaning up](#cleaning-up)
  - [Further reading](#further-reading)

<!-- /TOC -->

**Message Producer**

Small utility that when invoked, publishes an "event" message to an SNS topic.

**Message Consumer**

Lambda function that reads from the SNS topic and processes the data - by incrementing a simple counter.

**Getting Started**

```
npm i
```

## Test Services with Pact

To run both the consumer and provider pact tests:

```
npm t
```

Or individually:

```
npm run test:consumer
npm run test:publish # publish contracts to the broker
npm run test:provider
```

## Deployment

You can run this stack in AWS. It uses services within the [free tier](https://aws.amazon.com/free/?awsf.default=categories%23alwaysfree) to reduce potential costs.

To use any of the commands below, ensure you have valid [AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) for your environment.

### Pact Broker integration

Using the test broker at https://test.pact.dius.com.au (user/pass: `dXfltyFMgNOFZAxr8io9wJ37iUpY42M` / `O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`), we make use of the [`can-i-deploy` tool](https://github.com/pact-foundation/pact_broker/wiki/Provider-verification-results#querying) (available from the [Pact CLI suite](https://github.com/pact-foundation/pact-ruby-standalone/releases) but also bundled as part of `pact`), that ensures it is safe to deploy the consumer or provider before a releasing a change.

Whenever we create, change or verify a contract with Pact, the results are shared with the broker, which is then able to determine compatibility between components at any point in time.

You can see this in action by running one of the following:

```sh
npm run can-i-deploy # For both
npm run can-i-deploy:consumer # Just consumer
npm run can-i-deploy:provider # Yep, just the provider
```

You will see something like:

```sh
Computer says yes \o/

CONSUMER             | C.VERSION | PROVIDER             | P.VERSION | SUCCESS?
---------------------|-----------|----------------------|-----------|---------
SNSPactEventConsumer | 1.0.1     | SNSPactEventProvider | 1.0.0     | true

All verification results are published and successful
```

### Running deployment

```sh
npm run deploy
```

This will first check with `can-i-deploy`. If you want to skip this process, you can simply run:

```sh
serverless deploy -f provider
serverless deploy -f consumer
```

## Running

**Invoking the provider**

```sh
serverless invoke -f provider -l
```

You should see something like:

```sh
matt λ serverless invoke -f provider -l
{
    "id": 65,
    "event": "an update to something useful",
    "type": "update"
}
--------------------------------------------------------------------
START RequestId: 87050842-3536-11e8-ba23-e7bc78dfd40c Version: $LATEST
END RequestId: 87050842-3536-11e8-ba23-e7bc78dfd40c
REPORT RequestId: 87050842-3536-11e8-ba23-e7bc78dfd40c	Duration: 169.04 ms	Billed Duration: 200 ms 	Memory Size: 1024 MB	Max Memory Used: 40 MB
```

**Watching the consumer**
```sh
serverless logs -f consumer -t
```

When an event is published to the topic, your consumer should log to console something like the following:

```sh
matt λ serverless logs -f consumer -t
START RequestId: 8784bf84-3536-11e8-be0c-038b85b513b9 Version: $LATEST
2018-04-01 08:54:55.878 (+10:00)	8784bf84-3536-11e8-be0c-038b85b513b9	Received event from SNS
2018-04-01 08:54:55.878 (+10:00)	8784bf84-3536-11e8-be0c-038b85b513b9	Event: { id: 65,
  event: 'an update to something useful',
  type: 'update' }
...
2018-04-01 08:54:55.881 (+10:00)	8784bf84-3536-11e8-be0c-038b85b513b9	Event count: 1
END RequestId: 8784bf84-3536-11e8-be0c-038b85b513b9
REPORT RequestId: 8784bf84-3536-11e8-be0c-038b85b513b9	Duration: 5.55 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 32 MB
```

## Cleaning up

When you are done with your serverless stack, simply run:

```
serverless remove -v
```

## Further reading

For further reading and introduction into the topic of asynchronous services contract testing, see this [article](https://dius.com.au/2017/09/22/contract-testing-serverless-and-asynchronous-applications/)
and our other [example](https://github.com/pact-foundation/pact-js/tree/master/examples/messages) for a more detailed overview of these concepts.
