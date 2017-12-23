# Pact JS
[![Join the chat at https://gitter.im/realestate-com-au/pact](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/realestate-com-au/pact?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/pact-foundation/pact-js.svg?branch=master)](https://travis-ci.org/pact-foundation/pact-js)
[![Coverage Status](https://coveralls.io/repos/github/pact-foundation/pact-js/badge.svg?branch=master)](https://coveralls.io/github/pact-foundation/pact-js?branch=master)
[![Code Climate](https://codeclimate.com/github/pact-foundation/pact-js/badges/gpa.svg)](https://codeclimate.com/github/pact-foundation/pact-js)
[![Issue Count](https://codeclimate.com/github/pact-foundation/pact-js/badges/issue_count.svg)](https://codeclimate.com/github/pact-foundation/pact-js)
[![Dependency Status](https://gemnasium.com/badges/github.com/pact-foundation/pact-js.svg)](https://gemnasium.com/github.com/pact-foundation/pact-js)
[![npm](https://img.shields.io/github/license/pact-foundation/pact-js.svg?maxAge=2592000)](https://github.com/pact-foundation/pact-js/blob/master/LICENSE)

Implementation of the consumer driven contract library [Pact](https://github.com/pact-foundation/pact-specification) for Javascript.

From the [Pact website](http://docs.pact.io/):

>The Pact family of frameworks provide support for [Consumer Driven Contracts](http://martinfowler.com/articles/consumerDrivenContracts.html) testing.

>A Contract is a collection of agreements between a client (Consumer) and an API (Provider) that describes the interactions that can take place between them.

>Consumer Driven Contracts is a pattern that drives the development of the Provider from its Consumers point of view.

>Pact is a testing tool that guarantees those Contracts are satisfied.

Read [Getting started with Pact](http://dius.com.au/2016/02/03/microservices-pact/) for more information on
how to get going.

**NOTE: This project supersedes [Pact Consumer JS DSL](https://github.com/DiUS/pact-consumer-js-dsl).**

<!-- TOC -->

- [Pact JS](#pact-js)
  - [Installation](#installation)
    - [Latest (5.x.x)](#latest-5xx)
    - [Stable (4.x.x)](#stable-4xx)
  - [Using Pact JS](#using-pact-js)
    - [Consumer Side Testing](#consumer-side-testing)
      - [API](#api)
      - [Constructor Options](#constructor-options)
      - [Example](#example)
    - [Provider API Testing](#provider-api-testing)
      - [Verification Options](#verification-options)
      - [API with Provider States](#api-with-provider-states)
      - [API with Authorization](#api-with-authorization)
    - [Publishing Pacts to a Broker](#publishing-pacts-to-a-broker)
      - [Publishing options](#publishing-options)
      - [Publishing Verification Results to a Pact Broker](#publishing-verification-results-to-a-pact-broker)
    - [Matching](#matching)
      - [Match common formats](#match-common-formats)
      - [Match based on type](#match-based-on-type)
      - [Match based on arrays](#match-based-on-arrays)
      - [Match by regular expression](#match-by-regular-expression)
  - [Tutorial (60 minutes)](#tutorial-60-minutes)
  - [Examples](#examples)
  - [Using Pact in non-Node environments](#using-pact-in-non-node-environments)
    - [Using Pact with Karma](#using-pact-with-karma)
    - [Using Pact with RequireJS](#using-pact-with-requirejs)
  - [Troubleshooting](#troubleshooting)
    - [Parallel tests](#parallel-tests)
    - [Splitting tests across multiple files](#splitting-tests-across-multiple-files)
    - [Re-run specific verification failures](#re-run-specific-verification-failures)
    - [Timeout](#timeout)
    - [Note on Jest](#note-on-jest)

<!-- /TOC -->

## Installation

### Latest (5.x.x)

```
npm install --save-dev @pact-foundation/pact
```

_NOTE_: the `5.x.x` release contains several breaking changes from the previous version and will be maintained in parallel with the previous stable version. See the [`4.x.x`](https://github.com/pact-foundation/pact-js/tree/4.x.x) documentation for more details.

### Stable (4.x.x)

```
npm install --save-dev pact
```

See [`4.x.x` documentation](https://github.com/pact-foundation/pact-js/tree/4.x.x) for usage details.

## Using Pact JS

### Consumer Side Testing

To use the library on your tests, add the pact dependency:

```javascript
const { Pact } = require('pact')
```

The `Pact` class provides the following high-level APIs, they are listed in the order in which they typically get called in the lifecycle of testing a consumer:

#### API
|API                    |Options     |Returns|Description                                       |
|-----------------------|------------|------------------------------------------------------|---|
|`new Pact(options)`        |See constructor options below |`Object` |Creates a Mock Server test double of your Provider API. If you need multiple Providers for a scenario, you can create as many as these as you need.                  |
|`setup()`              |n/a         |`Promise`|Start the Mock Server and wait for it to be available. You would normally call this only once in a `beforeAll(...)` type clause |
|`addInteraction()`     |`Object`    |`Promise`|Register an expectation on the Mock Server, which must be called by your test case(s). You can add multiple interactions per server, and each test would normally contain one or more of these. These will be validated and written to a pact if successful.
|`verify()`             |n/a         |`Promise`|Verifies that all interactions specified. This should be called once per test, to ensure your expectations were correct |
|`finalize()`           |n/a         |`Promise`|Records the interactions registered to the Mock Server into the pact file and shuts it down. You would normally call this only once in an `afterAll(...)` type clause.|

#### Constructor Options

|Parameter | Required?  | Type        | Description |
|----------|------------|-------------|--------------|
| `consumer` | yes | string | The name of the consumer |
| `provider` | yes | string | The name of the provider |
| `port` | no | number | The port to run the mock service on, defaults to 1234 |
| `host` | no | string | The host to run the mock service, defaults to 127.0.0.1 |
| `ssl` | no | boolean | SSL flag to identify the protocol to be used (default false, HTTP) |
| `sslcert` | no | string | Path to SSL certificate to serve on the mock service |
| `sslkey` | no | string | Path to SSL key to serve on the mock service |
| `dir` | no | string | Directory to output pact files |
| `log` | no | string | Directory to log to |
| `logLevel` | no | string | Log level: one of 'trace', 'debug', 'info', 'error', 'fatal' or 'warn' |
| `spec` | no | number | Pact specification version (defaults to 2) |
| `cors` | no | boolean | Allow CORS OPTION requests to be accepted, defaults to false |
| `pactfileWriteMode` | no | string | Control how the Pact files are written. Choices: 'overwrite' 'update' or 'none'. Defaults to 'overwrite'|

#### Example
The first step is to create a test for your API Consumer. The example below uses [Mocha](https://mochajs.org), and demonstrates the basic approach:

1. Create the Pact object
1. Start the Mock Provider that will stand in for your actual Provider
1. Add the interactions you expect your consumer code to make when executing the tests
1. Write your tests - the important thing here is that you test the outbound _collaborating_ function which calls the Provider, and not just issue raw http requests to the Provider. This ensures you are testing your actual running code, just like you would in any other unit test, and that the tests will always remain up to date with what your consumer is doing.
1. Validate the expected interactions were made between your consumer and the Mock Service
1. Generate the pact(s)

Check out the `examples` folder for examples with Karma Jasmine, Mocha and Jest. The example below is taken from the [integration spec](https://github.com/pact-foundation/pact-js/blob/master/test/dsl/integration.spec.js).

```javascript
const path = require('path')
const chai = require('chai')
const { Pact } = require('pact')
const chaiAsPromised = require('chai-as-promised')

const expect = chai.expect
const MOCK_SERVER_PORT = 2202

chai.use(chaiAsPromised);

describe('Pact', () => {

  // (1) Create the Pact object to represent your provider
  const provider = new Pact({
    consumer: 'TodoApp',
    provider: 'TodoService',
    port: MOCK_SERVER_PORT,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'INFO',
    spec: 2
  })

  // this is the response you expect from your Provider
  const EXPECTED_BODY = [{
    id: 1,
    name: 'Project 1',
    due: '2016-02-11T09:46:56.023Z',
    tasks: [
      {id: 1, name: 'Do the laundry', 'done': true},
      {id: 2, name: 'Do the dishes', 'done': false},
      {id: 3, name: 'Do the backyard', 'done': false},
      {id: 4, name: 'Do nothing', 'done': false}
    ]
  }]

  context('when there are a list of projects', () => {
    describe('and there is a valid user session', () => {
      before((done) => {
        // (2) Start the mock server
        provider.setup()
          // (3) add interactions to the Mock Server, as many as required
          .then(() => {
            provider.addInteraction({
              // The 'state' field specifies a "Provider State"
              state: 'i have a list of projects',
              uponReceiving: 'a request for projects',
              withRequest: {
                method: 'GET',
                path: '/projects',
                headers: { 'Accept': 'application/json' }
              },
              willRespondWith: {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: EXPECTED_BODY
              }
            })
          })
          .then(() => done())
      })

      // (4) write your test(s)
      it('should generate a list of TODOs for the main screen', () => {
        const todoApp = new TodoApp();
        todoApp.getProjects() // <- this method would make the remote http call
          .then((projects) => {
      	    expect(projects).to.be.a('array')
            expect(projects).to.have.deep.property('projects[0].id', 1)

            // (5) validate the interactions you've registered and expected occurred
            // this will throw an error if it fails telling you what went wrong
      	    expect(provider.verify()).to.not.throw()
          })
      })

      // (6) write the pact file for this consumer-provider pair,
      // and shutdown the associated mock server.
      // You should do this only _once_ per Provider you are testing.
      after(() => {
        provider.finalize()
      })
    })
  })
})

```

### Provider API Testing

Once you have created Pacts for your Consumer, you need to validate those Pacts against your Provider. The Verifier object provides the following API for you to do so:

|API                    |Options       |Returns|Description                            |
|-----------------------|:------------:|-------|---------------------------------------|
|`verifyProvider()`     | See below    |`Promise`|Start the Mock Server                |

1. Start your local Provider service.
1. Optionally, instrument your API with ability to configure [provider states](https://github.com/pact-foundation/pact-provider-verifier/)
1. Then run the Provider side verification step

```js
const { Verifier } = require('pact');
let opts = {
  ...
};

new Verifier().verifyProvider(opts).then(function () {
	// do something
});
```

#### Verification Options

| Parameter             | Required     | Type |Description                            |
|-----------------------|:------------:|-------|--------------------------------------|
| `providerBaseUrl` | true | string | Running API provider host endpoint. Required.   |
| `provider` | true | string | Name of the Provider. Required. |
| `pactUrls` | true |  array of strings | Array of local Pact file paths or HTTP-based URLs (e.g. from a broker). Re`quired` if not using a Broker. |
| `pactBrokerUrl` | false | string | URL of the Pact Broker to retrieve pacts from. Required if not using pactUrls. |
| `tags` | false |  array of strings | Array of tags, used to filter pacts from the Broker. Optional. |
| `providerStatesSetupUrl` | false | string | URL to send PUT requests to setup a given provider state. Optional, required only if you provide a 'state' in any consumer tests. |
| `pactBrokerUsername` | false | string | Username for Pact Broker basic authentication |
| `pactBrokerPassword` | false | string | Password for Pact Broker basic authentication |
| `publishVerificationResult` | false | boolean | Publish verification result to Broker |
| `providerVersion` | false |  boolean | Provider version, required to publish verification results to a broker|
| `customProviderHeaders` | false |  array of strings | Header(s) to add to provider state set up and pact verification re`quests`. eg 'Authorization: Basic cGFjdDpwYWN0'.Broker. Optional otherwise. |
| `timeout` | false | number | The duration in ms we should wait to confirm verification process was successful. Defaults to 30000, Optional. |

That's it! Read more about [Verifying Pacts](http://docs.pact.io/documentation/verifying_pacts.html).

#### API with Provider States

If you have any `state`'s in your consumer tests that you need to validate during verification, you will need
to configure your provider for Provider States. This means you must specify `providerStatesSetupUrl`
in the `verifyProvider` function and configure an extra (dynamic) API endpoint to setup provider state (`--provider-states-setup-url`) for the given test state, which sets the active pact consumer and provider state accepting two parameters: `consumer` and `state` and returns an HTTP `200` eg. `consumer=web&state=customer%20is%20logged%20in`.

See this [Provider](https://github.com/pact-foundation/pact-js/blob/master/examples/e2e/test/provider.spec.js) for a working example, or read more about [Provider States](https://docs.pact.io/documentation/provider_states.html).

#### API with Authorization

Sometimes you may need to add things to the requests that can't be persisted in a pact file. Examples of these would be authentication tokens, which have a small life span. e.g. an OAuth bearer token: `Authorization: Bearer 0b79bab50daca910b000d4f1a2b675d604257e42`.

For this case, we have a facility that should be carefully used during verification - the ability to specificy custom headers to be sent during provider verification. The flag to achieve this is `customProviderHeaders`.

For example, to have two headers sent as part of the verification request, modify the `verifyProvider` options as per below:

```js
let opts = {
  provider: 'Animal Profile Service',
  ...
  customProviderHeaders: ['Authorization: Bearer e5e5e5e5e5e5e5', 'SomeSpecialHeader: some specialvalue']
}

return new Verifier().verifyProvider(opts).then(output => { ... })
```

As you can see, this is your opportunity to modify\add to headers being sent to the Provider API, for example to create a valid time-bound token.

*Important Note*: You should only use this feature for things that can not be persisted in the pact file. By modifying the request, you are potentially modifying the contract from the consumer tests!

### Publishing Pacts to a Broker

Sharing is caring - to simplify sharing Pacts between Consumers and Providers, checkout [sharing pacts](http://docs.pact.io/documentation/sharings_pacts.html) using the [Pact Broker](https://github.com/bethesque/pact_broker).

```js
let pact = require('@pact-foundation/pact-node');
let opts = {
   ...
};

pact.publishPacts(opts)).then(function () {
	// do something
});
```

#### Publishing options

| Parameter             | Required     | Type |Description                            |
|-----------------------|:------------:|-------|--------------------------------------|
| `providerBaseUrl` | true | string | Running API provider host endpoint. Required.   |
| `pactUrls` | false | array of strings | Array of local Pact files or directories containing pact files. Path must be absolute. Required. |
| `pactBroker` | false | string | The base URL of the Pact Broker. eg. https://test.pact.dius.com.au. Required. |
| `pactBrokerUsername` | false | string | Username for Pact Broker basic authentication. Optional |
| `pactBrokerPassword` | false | string | Password for Pact Broker basic authentication. Optional |
| `consumerVersion` |false | string | A string containing a semver-style version e.g. 1.0.0. Required. |
| `tags` |false | array of strings | Tag your pacts, often used with your branching, release or environment strategy e.g. ['prod', 'test'] |

#### Publishing Verification Results to a Pact Broker

If you're using a Pact Broker (e.g. a hosted one at pact.dius.com.au), you can
publish your verification results so that consumers can query if they are safe
to release.

It looks like this:

![screenshot of verification result](https://cloud.githubusercontent.com/assets/53900/25884085/2066d98e-3593-11e7-82af-3b41a20af8e5.png)

You need to specify the following when constructing the pact object:

```js
let opts = {
  provider: 'Animal Profile Service',
  ...
  publishVerificationResult: true,
  providerVersion: "1.0.0",
  provider: "Foo",

}
```

_NOTE_: You need to be retrieving pacts from the broker for this feature to work.

### Matching

Matching makes your tests more expressive making your tests less brittle.

Rather than use hard-coded values which must then be present on the Provider side,
you can use regular expressions and type matches on objects and arrays to validate the
structure of your APIs.

_NOTE: Make sure to start the mock service via the `Pact` declaration with the option `specification: 2` to get access to these features._

#### Match common formats

Often times, you find yourself having to re-write regular expressions for common formats. We've created a number of them for you to save you the time:

| method | description |
|--------|-------------|
| `boolean` | Match a boolean value (using equality) |
| `integer` | Will match all numbers that are integers (both ints and longs)|
| `decimal` | Will match all real numbers (floating point and decimal)|
| `hexadecimal` | Will match all hexadecimal encoded strings |
| `iso8601Date` | Will match string containing basic ISO8601 dates (e.g. 2016-01-01)|
| `iso8601DateTime` | Will match string containing ISO 8601 formatted dates (e.g. 2015-08-06T16:53:10+01:00)|
| `iso8601DateTimeWithMillis` | Will match string containing ISO 8601 formatted dates, enforcing millisecond precision (e.g. 2015-08-06T16:53:10.123+01:00)|
| `rfc3339Timestamp` | Will match a string containing an RFC3339 formatted timestapm (e.g. Mon, 31 Oct 2016 15:21:41 -0400)|
| `iso8601Time` | Will match string containing times (e.g. T22:44:30.652Z)|
| `ipv4Address` | Will match string containing IP4 formatted address |
| `ipv6Address` | Will match string containing IP6 formatted address |
| `uuid` | Will match strings containing UUIDs |

#### Match based on type

```javascript
const { like } = pact

provider.addInteraction({
  state: 'Has some animals',
  uponReceiving: 'a request for an animal',
  withRequest: {
    method: 'GET',
    path: '/animals/1'
  },
  willRespondWith: {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: {
      id: 1,
      name: like('Billy'),
      address: like({
      	street: '123 Smith St',
	suburb: 'Smithsville',
	postcode: 7777
      })
    }
  }
})
```

Note that you can wrap a `like` around a single value or an object. When wrapped around an object, all values and child object values will be matched according to types, unless overridden by something more specific like a `term`.

[flexible-matching]: https://github.com/realestate-com-au/pact/wiki/Regular-expressions-and-type-matching-with-Pact

#### Match based on arrays

Matching provides the ability to specify flexible length arrays. For example:

```javascript
pact.eachLike(obj, { min: 3 })
```

Where `obj` can be any javascript object, value or Pact.Match. It takes optional argument (`{ min: 3 }`) where min is greater than 0 and defaults to 1 if not provided.

Below is an example that uses all of the Pact Matchers.

```javascript
const { somethingLike: like, term, eachLike } = pact

const animalBodyExpectation = {
  'id': 1,
  'first_name': 'Billy',
  'last_name': 'Goat',
  'animal': 'goat',
  'age': 21,
  'gender': term({
    matcher: 'F|M',
    generate: 'M'
  }),
  'location': {
    'description': 'Melbourne Zoo',
    'country': 'Australia',
    'post_code': 3000
  },
  'eligibility': {
    'available': true,
    'previously_married': false
  },
  'children': eachLike({'name': 'Sally', 'age': 2})
}

// Define animal list payload, reusing existing object matcher
// Note that using eachLike ensure that all values are matched by type
const animalListExpectation = eachLike(animalBodyExpectation, {
  min: MIN_ANIMALS
})

provider.addInteraction({
  state: 'Has some animals',
  uponReceiving: 'a request for all animals',
  withRequest: {
    method: 'GET',
    path: '/animals/available'
  },
  willRespondWith: {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: animalListExpectation
  }
})
```

#### Match by regular expression

If none of the above matchers or formats work, you can write your own regex matcher.

The underlying mock service is written in Ruby, so the regular expression must be in a Ruby format, not a Javascript format.

```javascript
const { term } = pact

provider.addInteraction({
  state: 'Has some animals',
  uponReceiving: 'a request for an animal',
  withRequest: {
    method: 'GET',
    path: '/animals/1'
  },
  willRespondWith: {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: {
      id: 100,
      name: "billy",
      'gender': term({
        matcher: 'F|M',
        generate: 'F'
      }),
    }
  }
})
```

## Tutorial (60 minutes)

Learn everything in Pact JS in 60 minutes: https://github.com/DiUS/pact-workshop-js

## Examples

* [Complete Example (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/e2e)
* [Pact with AVA (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/ava)
* [Pact with Jest (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/jest)
* [Pact with Mocha](https://github.com/pact-foundation/pact-js/tree/master/examples/mocha)
* [Pact with Karma + Jasmine](https://github.com/pact-foundation/pact-js/tree/master/karma/jasmine)
* [Pact with Karma + Mocha](https://github.com/pact-foundation/pact-js/tree/master/karma/mocha)

[![asciicast](https://asciinema.org/a/105793.png)](https://asciinema.org/a/105793)

## Using Pact in non-Node environments

Pact requires a Node runtime to be able to start and stop Mock servers, write logs and other things.

However, when used within browser or non-Node based environments - such as with Karma or ng-test - this is not possible.

To address this challenge, we have released a separate 'web' based module for this purpose - `pact-web`.
Whilst it still provides a testing DSL, it cannot start and stop mock servers as per the `pact`
package, so you will need to coordinate this yourself prior to and after executing any tests.

To get started, install `pact-web` and [Pact Node](https://github.com/pact-foundation/pact-node):

    npm install --save-dev @pact-foundation/pact-web @pact-foundation/pact-node

If you're not using Karma, you can start and stop the mock server using [Pact Node](https://github.com/pact-foundation/pact-node) or something like [Grunt Pact](https://github.com/pact-foundation/grunt-pact).

### Using Pact with Karma

We have create a [plugin](https://github.com/pact-foundation/karma-pact) for Karma,
which will automatically start and stop any Mock Server for your Pact tests.

Modify your `karma.conf.js` file as per below to get started:

```js
    // Load pact framework - this will start/stop mock server automatically
    frameworks: ['pact'],

    // Load the pact and default karma plugins
    plugins: [
      'karma-*',
      '@pact-foundation/karma-pact'
    ],

    // load pact web module
    files: [
      'node_modules/@pact-foundation/pact-web/pact-web.js',
      ...
    ],

    // Configure the mock service
    pact: [{
      port: 1234,
      consumer: 'KarmaMochaConsumer',
      provider: 'KarmaMochaProvider',
      logLevel: 'DEBUG',
      log: path.resolve(process.cwd(), 'logs', 'pact.log'),
      dir: path.resolve(process.cwd(), 'pacts')
    }],
```

Check out the [Examples](#examples) for how to use the Karma interface.

### Using Pact with RequireJS

The module name should be "Pact" - not "pact-js". An example config with a karma test might look
like the following:

In `client-spec.js` change the `define` to:

```js
define(['client', 'Pact'], function (example, Pact) {
```

In `test-main.js`:

```js
require.config({
    baseUrl: '/base',
    paths: {
        'Pact': 'node_modules/pact-web/pact-web',
        'client': 'js/client'
    },
    deps: allTestFiles,
    callback: window.__karma__.start
})
```

See this [Stack Overflow](https://stackoverflow.com/a/44170373/1008568) question for background, and
this [gist](https://gist.github.com/mefellows/15c9fcb052c2aa9d8951f91d48d6da54) with a working example.

## Troubleshooting

If you are having issues, a good place to start is setting `logLevel: 'DEBUG'`
when configuring the `new Pact({...})` object.

### Parallel tests

Pact tests are inherently stateful, as we need to keep track of the interactions on a per-test basis, to ensure each contract is validated in isolation from others. However, in larger test suites or modern test frameworks (like Ava), this can result in slower test execution.

The good news is, parallel test execution is possible, you need to ensure that:

1. Before any test run invocation, you remove any existing pact files (otherwise you may end up with invalid interactions left over from previous test runs)
1. Each test is fully self-contained, with its own mock server on its own port
1. You set the option `pactfileWriteMode` to `"merge"`, instructing Pact to merge any pact documents with the same consumer and provider pairing at the end of all test runs.

When all of your tests have completed, the result is the union of the all of the interactions from each test case in the generated pact file.

See the following examples for working parallel tests:

* [Pact with AVA (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/ava)
* [Pact with Mocha](https://github.com/pact-foundation/pact-js/tree/master/examples/mocha)

### Splitting tests across multiple files

Pact tests tend to be quite long, due to the need to be specific about request/response payloads. Often times it is nicer to be able to split your tests across multiple files for manageability.

You have a number of options to achieve this feat:

1. Consider implementing the [Parallel tests](#parallel-tests) guidelines.

1. Create a Pact test helper to orchestrate the setup and teardown of the mock service for multiple tests.

    In larger test bases, this can significantly reduce test suite time and the amount of code you have to manage.

    See this [example](https://github.com/tarciosaraiva/pact-melbjs/blob/master/helper.js) and this [issue](https://github.com/pact-foundation/pact-js/issues/11) for more.

1. Set `pactfileWriteMode` to `update` in the `Pact()` constructor

    This will allow you to have multiple independent tests for a given Consumer-Provider pair, without it clobbering previous interactions, thereby allowing you to incrementally build up or modify your pact files.

    This feature addresses the use case of "my pact suite takes bloody ages to run, so I just want to replace the interactions that have been run in this test execution" and requires careful management

    _NOTE_: If using this approach, you *must* be careful to clear out existing pact files (e.g. `rm ./pacts/*.json`) before you run tests to ensure you don't have left over requests that are no longer relevent.

    See this [PR](https://github.com/pact-foundation/pact-js/pull/48) for background.

### Re-run specific verification failures

If you prefix your test command (e.g. `npm t`) with the following two environment variables, you can selectively run a specific interaction during provider verification.

For the e2e example, let's assume we have the following failure:

```sh
3 interactions, 2 failures

Failed interactions:

* A request for all animals given Has some animals

* A request for an animal with id 1 given Has an animal with ID 1
```

If we wanted to target the second failure, we can extract the description and state as the bits before and after the word "given":

```sh
PACT_DESCRIPTION="a request for an animal with ID 1" PACT_PROVIDER_STATE="Has an animal with ID 1" npm t
```

Also note that `PACT_DESCRIPTION` is the failing `description` and `PACT_PROVIDER_STATE` is the corresponding `providerState` from the pact file itself.

### Timeout

Under the hood, Pact JS spins up a [Ruby Mock Service](https://github.com/pact-foundation/pact-mock-service-npm).
On some systems, this may take more than a few seconds to start. It is recommended
to review your unit testing timeout to ensure it has sufficient time to start the server.

See [here](http://stackoverflow.com/questions/42496401/all-pact-js-tests-are-failing-with-same-errors/42518752) for more details.

### Note on Jest
Jest uses JSDOM under the hood which may cause issues with libraries making HTTP request.
Jest also can run tests in parallel, which is currently not supported as the mock server is stateful.

You'll need to add the following snippet to your `package.json` to ensure it uses
the proper Node environment:

```js
"jest": {
  "testEnvironment": "node"
}
```

Also, [from Jest 20](https://facebook.github.io/jest/blog/2017/05/06/jest-20-delightful-testing-multi-project-runner.html), you can add the environment to the top of the test file as a comment. This will allow your pact test to run along side the rest of your JSDOM env tests.

```js
/**
 * @jest-environment node
 */
 ```

See [this issue](https://github.com/pact-foundation/pact-js/issues/10) for background,
and the Jest [example](https://github.com/pact-foundation/pact-js/blob/master/examples/jest/package.json#L10-L12) for a working example.

### Debugging

If your standard tricks don't get you anywhere, setting the logLevel to `DEBUG` and increasing the timeout doesn't help and you don't know where else to look, it could be that the binaries we use to do much of the Pact magic aren't starting as expected.

Try starting the mock service manually and seeing if it comes up. When submitting a bug report, it would be worth running these commands before hand as it will greatly help us:

```
./node_modules/@pact-foundation/pact-standalone/platforms/<platform>/bin/pact-mock-service
```

...and also the verifier (it will whinge about missing params, but that means it works):

```
./node_modules/@pact-foundation/pact-standalone/platforms/darwin/bin/pact-provider-verifier
```

## Contributing
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

If you would like to implement `Pact` in another language, please check out the [Pact specification](https://github.com/bethesque/pact-specification) and have a chat to one of us on the [pact-dev Google group](https://groups.google.com/forum/#!forum/pact-support).

The vision is to have a compatible `Pact` implementation in all the commonly used languages, your help would be greatly appreciated!

## Contact

* Twitter: [@pact_up](https://twitter.com/pact_up)
* Stack Overflow: https://stackoverflow.com/questions/tagged/pact
* Google users group: https://groups.google.com/forum/#!forum/pact-support
