# Pact JS
Pact for all things Javascript.

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

## Contact

* Twitter: [@pact_up](https://twitter.com/pact_up)
* Google users group: https://groups.google.com/forum/#!forum/pact-support

## How to use it
This package is not yet published to [NPM](https://www.npmjs.com/) so you will need to install it manually by modifying your `package.json`.

#### Installation
It's easy, simply add the line below to your `devDependencies` group...
```
"pact": "pact-foundation/pact-js"
```
... then run `npm install` and you are good to go.

#### Usage
The library provides a Verifer, Matchers and an interceptor:

>**Verifier** is the Pact Consumer DSL to create and verify interactions with the Provider as well as writing Pact files.
>
>**Matchers** are little techniques that allow to partially verify some data on the interaction.
>
>**Interceptor** is a utility that can be used to intercept requests to provider in case it's complicated for you to change your underlying implementation to talk to different servers.

To use the library on your tests, do as you would normally with any other dependency:

```javascript
// ES6
import { Verifier, Matchers, Interceptor } from 'pact-js'

// you have to new the Interceptor
// the others are just plain objects
const interceptor = new Interceptor()

// ~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
// ES5
var Pact = require('pact-js')
var verifier = Pact.Verifier
var matchers = Pact.Matcher

// you have to new the Interceptor
var Interceptor = new Pact.Interceptor()
```

Then to write a test that will generate a Pact file, here's an example below - it uses [Mocha](https://mochajs.org). There's a bit going on in there as we are spinning up the Pact Mock Service Provider to mock a real server on the provider server. This is needed because that's where we will record our interactions.

More questions about what's involved in Pact? [Read more about it](http://docs.pact.io/documentation/how_does_pact_work.html).

Check the `examples` folder for other examples.

```javascript
import { expect } from 'chai'
import Promise from 'bluebird'

// import the Verifier so you write your pacts
import { Verifier } from 'pact-js'
import request from 'superagent-bluebird-promise'

// great library to spin up the Pact Mock Server
// that will record interactions and eventually validate your pacts
import wrapper from '@pact-foundation/pact-node'

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

  var pact

  after(() => {
    wrapper.removeAllServers()
  });

  beforeEach((done) => {
    mockServer.start().then(() => {
      // in order to use the verifier, simply pass an object like below
      // it should contain the names of the consumer and provider in normal language
      pact = Verifier({ consumer: 'My Consumer', provider: 'My Provider' })
      done()
    })
  })

  afterEach((done) => {
    mockServer.delete().then(() => {
      done()
    })
  })

  context('with a single request', () => {
    it('successfully writes Pact file', (done) => {

      // the Verifier is Promise-based so make sure the function that is used
      // to invoke the endpoint returns a Promise
      // essentially this would be your client library in your source code
      // e.g.: client.requestProjects()
      function requestProjects () {
        return request.get('http://localhost:1234/projects').set({ 'Accept': 'application/json' })
      }

      // This is how you create an interaction
      pact.interaction()
        .given('i have a list of projects')
        .uponReceiving('a request for projects')
        .withRequest('get', '/projects', null, { 'Accept': 'application/json' })
        .willRespondWith(200, { 'Content-Type': 'application/json' }, EXPECTED_BODY)

      // and this is how the verification process invokes your request
      // and writes the Pact file if all is well, returning you the data of the request
      // so you can do your assertions
      pact.verify(requestProjects)
        .then((data) => {
          expect(JSON.parse(data)).to.eql(EXPECTED_BODY)
          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })
})
```
