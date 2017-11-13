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
  - [Using Pact JS](#using-pact-js)
    - [Consumer Side Testing](#consumer-side-testing)
      - [API](#api)
      - [Example](#example)
      - [Splitting tests across multiple files](#splitting-tests-across-multiple-files)
    - [Publishing Pacts to a Broker and Tagging Pacts](#publishing-pacts-to-a-broker-and-tagging-pacts)
    - [Provider API Testing](#provider-api-testing)
      - [API with Provider States](#api-with-provider-states)
      - [Publishing Verification Results to a Pact Broker](#publishing-verification-results-to-a-pact-broker)
    - [Publishing Pacts to a Broker](#publishing-pacts-to-a-broker)
    - [Flexible Matching](#flexible-matching)
      - [Match by regular expression](#match-by-regular-expression)
      - [Match based on type](#match-based-on-type)
      - [Match based on arrays](#match-based-on-arrays)
  - [Tutorial (60 minutes)](#tutorial-60-minutes)
  - [Examples](#examples)
  - [Using Pact in non-Node environments](#using-pact-in-non-node-environments)
    - [Using Pact with Karma](#using-pact-with-karma)
    - [Using Pact with RequireJS](#using-pact-with-requirejs)
  - [Troubleshooting](#troubleshooting)
    - [Timeout](#timeout)
    - [Note on Jest](#note-on-jest)

<!-- /TOC -->

## Installation

It's easy, simply run the below:
```
npm install --save-dev pact
```

## Using Pact JS

### Consumer Side Testing

To use the library on your tests, add the pact dependency:

```javascript
let Pact = require('pact')
```

The `Pact` interface provides the following high-level APIs, they are listed in the order in which they typically get called in the lifecycle of testing a consumer:

#### API
|API                    |Options     |Returns|Description                                       |
|-----------------------|------------|------------------------------------------------------|---|
|`pact(options)`        |See [Pact Node documentation](https://github.com/pact-foundation/pact-node#create-pact-mock-server) for options                              |`Object` |Creates a Mock Server test double of your Provider API. If you need multiple Providers for a scenario, you can create as many as these as you need.                  |
|`setup()`              |n/a         |`Promise`|Start the Mock Server                             |
|`addInteraction()`     |`Object`    |`Promise`|Register an expectation on the Mock Server, which must be called by your test case(s). You can add multiple interactions per server. These will be validated and written to a pact if successful.
|`verify()`             |n/a         |`Promise`|Verifies that all and only the interactions specified occurred and that they [match][request-matching]. You should call this function after any other assertions and once per test case. |
|`finalize()`           |n/a         |`Promise`|Records the interactions registered to the Mock Server into the pact file and shuts it down.                                               |
|`removeInteractions`   |n/a         |`Promise`|In some cases you might want to clear out the expectations of the Mock Service, call this to clear out any expectations for the next test run. _NOTE_: `verify()` will implicitly call this. |

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
const pact = require('pact')
const chaiAsPromised = require('chai-as-promised')

const expect = chai.expect
const MOCK_SERVER_PORT = 2202

chai.use(chaiAsPromised);

describe('Pact', () => {

  // (1) Create the Pact object to represent your provider
  const provider = pact({
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

#### Splitting tests across multiple files

Pact tests tend to be quite long, due to the need to be specific about request/response payloads. Often times it is nicer to be able to split your tests across multiple files for manageability.

You have two options to achieve this feat:

1. Create a Pact test helper to orchestrate the setup and teardown of the mock service for multiple tests.

    In larger test bases, this can significantly reduce test suite time and the amount of code you have to manage.

    See this [example](https://github.com/tarciosaraiva/pact-melbjs/blob/master/helper.js) and this [issue](https://github.com/pact-foundation/pact-js/issues/11) for more.

2. Set `pactfileWriteMode` to `update` in the `pact()` constructor

    This will allow you to have multiple independent tests for a given Consumer-Provider pair, without it clobbering previous interactions.

    In larger test suites, you'll incur a slow down due to the time taken to start and stop the underlying mock servers.

    See this [PR](https://github.com/pact-foundation/pact-js/pull/48) for background.

    _NOTE_: If using this approach, you *must* be careful to clear out existing pact files (e.g. `rm ./pacts/*.json`) before you run tests to ensure you don't have left over requests that are no longer relevent.

### Publishing Pacts to a Broker and Tagging Pacts

### Provider API Testing

Once you have created Pacts for your Consumer, you need to validate those Pacts against your Provider. The Verifier object provides the following API for you to do so:

|API                    |Options     |Returns|Description                                       |
|-----------------------|:------------:|----------------------------------------------|----|
|`verifyProvider()`              |n/a         |`Promise`|Start the Mock Server                             |

1. Start your local Provider service.
1. Optionally, instrument your API with ability to configure [provider states](https://github.com/pact-foundation/pact-provider-verifier/)
1. Then run the Provider side verification step

```js
const verifier = require('pact').Verifier;
let opts = {
	providerBaseUrl: <String>,            // Running API provider host endpoint. Required.
	pactBrokerUrl: <String>,              // URL of the Pact Broker to retrieve pacts from. Required if not using pactUrls.
	provider: <String>,                   // Name of the Provider. Required.
	tags: <Array>,                        // Array of tags, used to filter pacts from the Broker. Optional.
	pactUrls: <Array>,                    // Array of local Pact file paths or HTTP-based URLs (e.g. from a broker). Required if not using a Broker.
	providerStatesSetupUrl: <String>,     // URL to send PUT requests to setup a given provider state. Optional, required only if you provide a 'state' in any consumer tests.
	pactBrokerUsername: <String>,         // Username for Pact Broker basic authentication. Optional
	pactBrokerPassword: <String>,         // Password for Pact Broker basic authentication. Optional
	publishVerificationResult: <Boolean>, // Publish verification result to Broker. Optional
	providerVersion: <Boolean>,           // Provider version, required to publish verification result to Broker. Optional otherwise.
	timeout: <Number>                     // The duration in ms we should wait to confirm verification process was successful. Defaults to 30000, Optional.
};

verifier.verifyProvider(opts).then(function () {
	// do something
});
```

That's it! Read more about [Verifying Pacts](http://docs.pact.io/documentation/verifying_pacts.html).

#### API with Provider States

If you have any `state`'s in your consumer tests that you need to validate during verification, you will need
to configure your provider for Provider States. This means you must specify `providerStatesSetupUrl`
in the `verifier` constructor and configure an extra (dynamic) API endpoint to setup provider state (`--provider-states-setup-url`) for the given test state, which sets the active pact consumer and provider state accepting two parameters: `consumer` and `state` and returns an HTTP `200` eg. `consumer=web&state=customer%20is%20logged%20in`.

See this [Provider](https://github.com/pact-foundation/pact-js/blob/master/examples/e2e/test/provider.spec.js) for a working example, or read more about [Provider States](https://docs.pact.io/documentation/provider_states.html).

#### Publishing Verification Results to a Pact Broker

If you're using a Pact Broker (e.g. a hosted one at pact.dius.com.au), you can
publish your verification results so that consumers can query if they are safe
to release.

It looks like this:

![screenshot of verification result](https://cloud.githubusercontent.com/assets/53900/25884085/2066d98e-3593-11e7-82af-3b41a20af8e5.png)

You need to specify the following when constructing the pact object:

```js
publishVerificationResult: true,
providerVersion: "1.0.0",
provider: "Foo",
```

_NOTE_: You need to be already pulling pacts from the broker for this feature to work.

### Publishing Pacts to a Broker

Sharing is caring - to simplify sharing Pacts between Consumers and Providers, checkout [sharing pacts](http://docs.pact.io/documentation/sharings_pacts.html) using the [Pact Broker](https://github.com/bethesque/pact_broker).

```js
let pact = require('@pact-foundation/pact-node');
let opts = {
	pactUrls: <Array>,               // Array of local Pact files or directories containing pact files. Path must be absolute. Required.
	pactBroker: <String>,            // The base URL of the Pact Broker. eg. https://test.pact.dius.com.au. Required.
	pactBrokerUsername: <String>,    // Username for Pact Broker basic authentication. Optional
	pactBrokerPassword: <String>,    // Password for Pact Broker basic authentication. Optional
	consumerVersion: <String>        // A string containing a semver-style version e.g. 1.0.0. Required.
};

pact.publishPacts(opts)).then(function () {
	// do something
});
```

### Flexible Matching

Flexible matching makes your tests more expressive making your tests less brittle.
Rather than use hard-coded values which must then be present on the Provider side,
you can use regular expressions and type matches on objects and arrays to validate the
structure of your APIs.

[Read more about using regular expressions and type based matching](https://github.com/realestate-com-au/pact/wiki/Regular-expressions-and-type-matching-with-Pact) before continuing.

_NOTE: Make sure to start the mock service via the `Pact` declaration with the option `specification: 2` to get access to these features._

For simplicity, we alias the main matches to make our code more readable:

#### Match by regular expression

The underlying mock service is written in Ruby, so the regular expression must be in a Ruby format, not a Javascript format.

```javascript
const { term } = pact.Matchers

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

#### Match based on type

```javascript
const { somethingLike: like } = pact.Matchers

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
pact.Matchers.eachLike(obj, { min: 3 })
```

Where `obj` can be any javascript object, value or Pact.Match. It takes optional argument (`{ min: 3 }`) where min is greater than 0 and defaults to 1 if not provided.

Below is an example that uses all of the Pact Matchers.

```javascript
const { somethingLike: like, term, eachLike } = pact.Matchers

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

## Tutorial (60 minutes)

Learn everything in Pact JS in 60 minutes: https://github.com/DiUS/pact-workshop-js

## Examples

* [Complete Example (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/e2e)
* [Pact with AVA (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/ava)
* [Pact with Jest (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/jest)
* [Pact with Mocha](https://github.com/pact-foundation/pact-js/tree/master/examples/mocha)
* [Pact with Karma + Jasmine](https://github.com/pact-foundation/pact-js/tree/master/karma/jasmine)
* [Pact with Karma + Mocha](https://github.com/pact-foundation/pact-js/tree/master/karma/mocha)
* [Angular 4 + Mocha](https://github.com/stones/pact-angular-4-mocha)

[![asciicast](https://asciinema.org/a/105793.png)](https://asciinema.org/a/105793)

## Using Pact in non-Node environments

Pact requires a Node runtime to be able to start and stop Mock servers, write logs and other things.

However, when used within browser or non-Node based environments - such as with Karma or ng-test
- this is not possible.

To address this challenge, we have released a separate 'web' based module for this purpose - `pact-web`.
Whilst it still provides a testing DSL, it cannot start and stop mock servers as per the `pact`
package, so you will need to coordinate this yourself prior to and after executing any tests.

To get started, install `pact-web` and [Pact Node](https://github.com/pact-foundation/pact-node):

    npm install --save-dev pact-web @pact-foundation/pact-node

If you're not using Karma, you can start and stop the mock server using [Pact Node](https://github.com/pact-foundation/pact-node) or something like [Grunt Pact](https://github.com/pact-foundation/grunt-pact).

### Using Pact with Karma

We have create a [plugin](https://github.com/pact-foundation/karma-pact) for Karma,
which will automatically start and stop any Mock Server for your Pact tests.

Modify your `karma.conf.js` file as per below to get started:
```javascript
module.exports = function (config) {
  config.set({
    // in here we are simply telling to use Jasmine with Pact
    frameworks: ['pact'],
	// the Pact options will go here, you can start
	// as many providers as you need
    pact: [{
    	port: 1234,
    	consumer: "some-consumer",
    	provider: "some-provider",
		dir: "pact/files/go/here",
		log: "log/files/go/here"
	}],
	// ensure Pact and default karma plugins are loaded
    plugins: [
      'karma-*',
      '@pact-foundation/karma-pact',
    ],
  });
};
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
when configuring the `pact({...})` object.

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

### Parallel tests

Test runners like AVA and Jest may run tests in parallel. If you are seeing weird behaviour, configured your test runner to run in serial.

See issue [#124](https://github.com/pact-foundation/pact-js/issues/124) for more background.

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
* Google users group: https://groups.google.com/forum/#!forum/pact-support

[request-matching]: https://github.com/realestate-com-au/pact/wiki/Understanding-Request-Matching
