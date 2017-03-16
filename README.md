# Pact JS
[![Join the chat at https://gitter.im/realestate-com-au/pact](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/realestate-com-au/pact?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/pact-foundation/pact-js.svg?branch=master)](https://travis-ci.org/pact-foundation/pact-js)
[![Code Climate](https://codeclimate.com/github/pact-foundation/pact-js/badges/gpa.svg)](https://codeclimate.com/github/pact-foundation/pact-js)
[![Coverage Status](https://coveralls.io/repos/github/pact-foundation/pact-js/badge.svg?branch=master)](https://coveralls.io/github/pact-foundation/pact-js?branch=master)
[![Issue Count](https://codeclimate.com/github/pact-foundation/pact-js/badges/issue_count.svg)](https://codeclimate.com/github/pact-foundation/pact-js)
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

<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Pact JS](#pact-js)
	- [Installation](#installation)
	- [Using Pact JS](#using-pact-js)
		- [Using Mocha?](#using-mocha)
		- [Consumer Side Testing](#consumer-side-testing)
			- [API](#api)
			- [Example](#example)
		- [Provider API Testing](#provider-api-testing)
		- [Publishing Pacts to a Broker](#publishing-pacts-to-a-broker)
		- [Flexible Matching](#flexible-matching)
			- [Match by regular expression](#match-by-regular-expression)
			- [Match based on type](#match-based-on-type)
			- [Match based on arrays](#match-based-on-arrays)
		- [Examples](#examples)
	- [Troubleshooting](#troubleshooting)
		- [Timeout](#timeout)
		- [Note on Jest](#note-on-jest)
	- [Contributing](#contributing)
	- [Contact](#contact)

<!-- /TOC -->

## Installation

It's easy, simply run the below:
```
npm install --save-dev pact
```

## Using Pact JS

### Using Mocha?

Check out [Pact JS Mocha](https://github.com/pact-foundation/pact-js-mocha).

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
|`verify()`             |n/a         |`Promise`|Verifies that all interactions specified          |
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
let path = require('path')
let chai = require('chai')
let pact = require('pact')
let request = require ('superagent')
let chaiAsPromised = require('chai-as-promised')

let expect = chai.expect

chai.use(chaiAsPromised);

describe('Pact', () => {

  // (1) Create the Pact object to represent your provider
  const provider = pact({
    consumer: 'TodoApp',
    provider: 'TodoService',,
    port: MOCK_SERVER_PORT,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'INFO',
    spec: 2
  });

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
      it('should generate a list of TODOs for the main screen', (done) => {
        const todoApp = new TodoApp();
        const projects = todoApp.getProjects() // <- this method would make the remote http call
        expect(projects).to.eventually.be.a('array')
        expect(projects).to.eventually.have.deep.property('projects[0].id', 1).notify(done)
      })

      // (5) validate the interactions occurred, this will throw an error if it fails telling you what went wrong
      it('creates a contract between the TodoApp and TodoService', () => {
        return pact.verify()
      })
    })
  });

  // (6) write the pact file for this consumer-provider pair,
  // and shutdown the associated mock server.
  // You should do this only _once_ per Provider you are testing.
  after(() => {
    provider.finalize()
  });  
})
```

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
	providerBaseUrl: <String>,       // Running API provider host endpoint. Required.
	pactUrls: <Array>,               // Array of local Pact file paths or Pact Broker URLs (http based). Required.
	providerStatesUrl: <String>,     // URL to fetch the provider states for the given provider API. Optional.
	providerStatesSetupUrl <String>, // URL to send PUT requests to setup a given provider state. Optional.
	pactBrokerUsername: <String>,    // Username for Pact Broker basic authentication. Optional
	pactBrokerPassword: <String>,    // Password for Pact Broker basic authentication. Optional
  timeout: <Number>                // The duration in ms we should wait to confirm verification process was successful. Defaults to 30000, Optional.
};

verifier.verifyProvider(opts)).then(function () {
	// do something
});
```

That's it! Read more about [Verifying Pacts](http://docs.pact.io/documentation/verifying_pacts.html).

### Publishing Pacts to a Broker

Sharing is caring - to simplify sharing Pacts between Consumers and Providers, checkout [sharing pacts](http://docs.pact.io/documentation/sharings_pacts.html) using the [Pact Broker](https://github.com/bethesque/pact_broker).

```js
let pact = require('@pact-foundation/pact-node');
let opts = {
	pactUrls: <Array>,               // Array of local Pact files or directories containing pact files. Path must be absolute. Required.
	pactBroker: <String>,            // URL to fetch the provider states for the given provider API. Optional.
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

Read more about using regular expressions and type based matching [here][https://github.com/realestate-com-au/pact/wiki/Regular-expressions-and-type-matching-with-Pact] before continuing.

_NOTE: Make sure to start the mock service via the `Pact` declaration with the option `specification: 2` to get access to these features._

#### Match by regular expression

The underlying mock service is written in Ruby, so the regular expression must be in a Ruby format, not a Javascript format.

```javascript

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
      id: like(1),
      name: like('Billy')
    }
  }
})
```

[flexible-matching]: https://github.com/realestate-com-au/pact/wiki/Regular-expressions-and-type-matching-with-Pact

#### Match based on arrays

Matching provides the ability to specify flexible length arrays. For example:

```javascript
pact.Matchers.eachLike(obj, { min: 3 })
```

Where `obj` can be any javascript object, value or Pact.Match. It takes optional argument (`{ min: 3 }`) where min is greater than 0 and defaults to 1 if not provided.

Below is an example that uses all of the Pact Matchers.

```javascript

var somethingLike = pact.Matchers.somethingLike;
var term = pact.Matchers.term;
var eachLike = pact.Matchers.eachLike;

const animalBodyExpectation = {
  'id': like(1),
  'first_name': like('Billy'),
  'last_name': like('Goat'),
  'animal': like('goat'),
  'age': like(21),
  'gender': term({
    matcher: 'F|M',
    generate: 'M'
  }),
  'location': {
    'description': like('Melbourne Zoo'),
    'country': like('Australia'),
    'post_code': like(3000)
  },
  'eligibility': {
    'available': like(true),
    'previously_married': like(false)
  },
  'interests': eachLike('walks in the garden/meadow')
}

// Define animal list payload, reusing existing object matcher
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

### Examples

* [Complete Example (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/e2e)
* [Pact with Jest (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/jest)
* [Pact with Mocha](https://github.com/pact-foundation/pact-js/tree/master/examples/mocha)
* [Pact with Karma + Jasmine](https://github.com/pact-foundation/pact-js/tree/master/karma/jasmine)
* [Pact with Karma + Mocha](https://github.com/pact-foundation/pact-js/tree/master/karma/mocha)

[![asciicast](https://asciinema.org/a/105793.png)](https://asciinema.org/a/105793)

## Troubleshooting

If you are having issues, a good place to start is setting `logLevel: 'DEBUG'`
when configuring the `pact({...})` object.

### Timeout

Under the hood, Pact JS spins up a [Ruby Mock Service](https://github.com/pact-foundation/pact-mock-service-npm).
On some systems, this may take more than a few seconds to start. It is recommended
to review your unit testing timeout to ensure it has sufficient time to start the server.

See [here](http://stackoverflow.com/questions/42496401/all-pact-js-tests-are-failing-with-same-errors/42518752) for more details.

### Note on Jest
Jest uses JSDOM under the hood which may cause issues with libraries making HTTP request. See [this issue](https://github.com/pact-foundation/pact-js/issues/10) for background,
and the  Jest [example](https://github.com/pact-foundation/pact-js/blob/master/examples/jest/package.json#L10-L12) for a working solution.

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
