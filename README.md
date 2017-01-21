# Pact JS
[![Join the chat at https://gitter.im/realestate-com-au/pact](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/realestate-com-au/pact?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/pact-foundation/pact-js.svg?branch=master)](https://travis-ci.org/pact-foundation/pact-js)
[![Code Climate](https://codeclimate.com/github/pact-foundation/pact-js/badges/gpa.svg)](https://codeclimate.com/github/pact-foundation/pact-js)
[![Coverage Status](https://coveralls.io/repos/github/pact-foundation/pact-js/badge.svg?branch=master)](https://coveralls.io/github/pact-foundation/pact-js?branch=master)
[![Issue Count](https://codeclimate.com/github/pact-foundation/pact-js/badges/issue_count.svg)](https://codeclimate.com/github/pact-foundation/pact-js)
[![npm](https://img.shields.io/github/license/pact-foundation/pact-js.svg?maxAge=2592000)](https://github.com/pact-foundation/pact-js/blob/master/LICENSE)

Implementation of the consumer driven contract library [pact](https://github.com/pact-foundation/pact-specification) for Javascript.

From the [Pact website](http://docs.pact.io/):

>The Pact family of frameworks provide support for [Consumer Driven Contracts](http://martinfowler.com/articles/consumerDrivenContracts.html) testing.

>A Contract is a collection of agreements between a client (Consumer) and an API (Provider) that describes the interactions that can take place between them.

>Consumer Driven Contracts is a pattern that drives the development of the Provider from its Consumers point of view.

>Pact is a testing tool that guarantees those Contracts are satisfied.

Read [Getting started with Pact](http://dius.com.au/2016/02/03/microservices-pact/) for more information on
how to get going.

**NOTE: we are currently in the process of replacing [Pact Consumer JS DSL](https://github.com/DiUS/pact-consumer-js-dsl) with this library. Please bare with us whilst we transition. If you want to use Pact with JS and are new to Pact, start here.**

## Installation

It's easy, simply run the below:
```
npm install --save-dev pact
```

### Examples

* [Complete Example (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/e2e)
* [Pact with Jest (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/jest)
* [Pact with Mocha](https://github.com/pact-foundation/pact-js/tree/master/examples/mocha)
* [Pact with Karma + Jasmine](https://github.com/pact-foundation/pact-js/tree/master/karma/jasmine)
* [Pact with Karma + Mocha](https://github.com/pact-foundation/pact-js/tree/master/karma/mocha)

#### Note on Jest
Jest uses JSDOM under the hood which may cause issues with libraries making HTTP request. See [this issue](https://github.com/pact-foundation/pact-js/issues/10) for background,
and the  Jest [example](https://github.com/pact-foundation/pact-js/blob/master/examples/jest/package.json#L10-L12) for a working solution.

### Using Pact JS

#### Consumer Side Testing

The library provides a Verifier Service, Matchers and an API Interceptor:

>**Verifier** Sets up a test double (Verifier Provider API) with expected interactions. It's also responsible for generating Pact files.
>
>**Matchers** are functions you can use to increase the expressiveness of your tests, and reduce brittle test cases. See the [matching](http://docs.pact.io/documentation/matching.html) docs for more information.
>
>**Interceptor** is a utility that can be used to intercept requests to the Provider, where it's not simple for you to change your API endpoint.

To use the library on your tests, do as you would normally with any other dependency:

```javascript
var Pact = require('pact')
var matchers = Pact.Matchers
matchers.term()
matchers.somethingLike()
matchers.eachLike()
```

Then to write a test that will generate a Pact file, here's an example below - it uses [Mocha](https://mochajs.org). There's a bit going on in there as we are spinning up the Pact Verifier Service Provider to mock a real server on the provider server. This is needed because that's where we will record our interactions.

More questions about what's involved in Pact? [Read more about it](http://docs.pact.io/documentation/how_does_pact_work.html).

Check the `examples` folder for examples with Karma Jasmine / Mocha. The example below is taken from the [integration spec](https://github.com/pact-foundation/pact-js/blob/master/test/dsl/integration.spec.js).

```javascript
var path = require('path')
var chai = require('chai')
var Pact = require('pact')
var request = require ('superagent')
var chaiAsPromised = require('chai-as-promised')
var wrapper = require('@pact-foundation/pact-node')

var expect = chai.expect

chai.use(chaiAsPromised);

describe('Pact', () => {

  // when using the wrapper, you will need to tell it where to store the logs
  // make sure you the folders created before hand
  const mockServer = wrapper.createServer({
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
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

  var provider

  after(() => {
    wrapper.removeAllServers()
  });

  beforeEach((done) => {
    mockServer.start().then(() => {
      // in order to use the Verifier, simply pass an object like below
      // it should contain the names of the consumer and provider in normal language
      // you can also use a different port if you have multiple providers
      provider = Pact({ consumer: 'My Consumer', provider: 'My Provider', port: 1234 })
      done()
    })
  })

  afterEach((done) => {
    mockServer.delete().then(() => {
      done()
    })
  })

  context('with a single request', () => {
    describe('successfully writes Pact file', () => {

      // add interactions, as many as needed
      beforeEach((done) => {
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
        }).then(() => done())
      })

      // once test is run, write pact and remove interactions
      afterEach((done) => {
        provider.finalize().then(() => done())
      })

      // and this is how the verification process invokes your request
      // and writes the Pact file if all is well, returning you the data of the request
      // so you can do your assertions
      it('successfully verifies', (done) => {
        const verificationPromise = request
          .get('http://localhost:1234/projects')
          .set({ 'Accept': 'application/json' })
          .then(provider.verify)
        expect(verificationPromise).to.eventually.eql(JSON.stringify(EXPECTED_BODY)).notify(done)
      })
    })
  })
})
```

#### Provider API Testing

Once you have created Pacts for your Consumer, you need to validate those Pacts against your Provider.

First, install [Pact Node](https://github.com/pact-foundation/pact-node):

```
npm install @pact-foundation/pact-node --save
```

Then run the Provider side verification step:

```js
var pact = require('@pact-foundation/pact-node');
var opts = {
	providerBaseUrl: <String>,       // Running API provider host endpoint. Required.
	pactUrls: <Array>,               // Array of local Pact file paths or Pact Broker URLs (http based). Required.
	providerStatesUrl: <String>,     // URL to fetch the provider states for the given provider API. Optional.
	providerStatesSetupUrl <String>, // URL to send PUT requests to setup a given provider state. Optional.
	pactBrokerUsername: <String>,    // Username for Pact Broker basic authentication. Optional
	pactBrokerPassword: <String>,    // Password for Pact Broker basic authentication. Optional
};

pact.verifyPacts(opts)).then(function () {
	// do something
});
```

That's it! Read more about [Verifying Pacts](http://docs.pact.io/documentation/verifying_pacts.html).

### Publishing Pacts to a Broker

Sharing is caring - to simplify sharing Pacts between Consumers and Providers, checkout [sharing pacts](http://docs.pact.io/documentation/sharings_pacts.html).

```js
var pact = require('@pact-foundation/pact-node');
var opts = {
	pactUrls: <Array>,               // Array of local Pact files or directories containing them. Required.
	pactBroker: <String>,            // URL to fetch the provider states for the given provider API. Optional.
	pactBrokerUsername: <String>,    // Username for Pact Broker basic authentication. Optional
	pactBrokerPassword: <String>,    // Password for Pact Broker basic authentication. Optional
	consumerVersion: <String>        // A string containing a semver-style version e.g. 1.0.0. Required.  
};

pact.publishPacts(opts)).then(function () {
	// do something
});
```

### Using Mocha?

Check out [Pact JS Mocha](https://github.com/pact-foundation/pact-js-mocha).

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
