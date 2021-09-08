# Pact JS

<!-- Please use absolute URLs for all links as the content of this page is synced to docs.pact.io -->

[![Build Status](https://github.com/pact-foundation/pact-js/workflows/Build,%20test,%20test%20all%20examples/badge.svg)](https://github.com/pact-foundation/pact-js/actions?query=workflow%3A%22Build%2C+test%2C+test+all+examples%22)
[![npm](https://img.shields.io/npm/v/@pact-foundation/pact.svg)](https://www.npmjs.com/package/@pact-foundation/pact)
![Release workflow](https://github.com/pact-foundation/pact-js/workflows/Release%20workflow/badge.svg?branch=feat%2Fv3.0.0)
[![Coverage Status](https://coveralls.io/repos/github/pact-foundation/pact-js/badge.svg?branch=master)](https://coveralls.io/github/pact-foundation/pact-js?branch=master)
[![Code Climate](https://codeclimate.com/github/pact-foundation/pact-js/badges/gpa.svg)](https://codeclimate.com/github/pact-foundation/pact-js)
[![Issue Count](https://codeclimate.com/github/pact-foundation/pact-js/badges/issue_count.svg)](https://codeclimate.com/github/pact-foundation/pact-js)
[![Known Vulnerabilities](https://snyk.io/test/github/pact-foundation/pact-js/badge.svg?targetFile=package.json)](https://snyk.io/test/github/pact-foundation/pact-js?targetFile=package.json)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/pact-foundation/pact-js/blob/master/LICENSE)
[![slack](https://slack.pact.io/badge.svg)](https://slack.pact.io)

Implementation of the consumer driven contract library [Pact](https://docs.pact.io) for Javascript.

From the [Pact website](http://docs.pact.io/):

> The Pact family of frameworks provide support for [Consumer Driven Contracts](http://martinfowler.com/articles/consumerDrivenContracts.html) testing.

> A Contract is a collection of agreements between a client (Consumer) and an API (Provider) that describes the interactions that can take place between them.

> Consumer Driven Contracts is a pattern that drives the development of the Provider from its Consumers point of view.

> Pact is a testing tool that guarantees those Contracts are satisfied.

Read [Getting started with Pact] for more information for beginners.

<p align="center">
  <a href="https://asciinema.org/a/105793">
    <img width="880" src="https://raw.githubusercontent.com/pact-foundation/pact-js/master/.github/pact.svg?sanitize=true&t=1"></img>
  </a>
</p>

<!-- TOC -->

- [Pact JS](#pact-js)
  - [Installation](#installation)
    - [Do Not Track](#do-not-track)
  - [Which Library/Package should I use?](#which-librarypackage-should-i-use)
  - [Using Pact JS](#using-pact-js)
  - [HTTP API Testing](#http-api-testing)
    - [Consumer Side Testing](#consumer-side-testing)
      - [API](#api)
      - [Example](#example)
    - [Provider API Testing](#provider-api-testing)
      - [Verification Options](#verification-options)
      - [API with Provider States](#api-with-provider-states)
      - [Before and After Hooks](#before-and-after-hooks)
      - [Pending Pacts](#pending-pacts)
      - [WIP Pacts](#wip-pacts)
      - [Verifying multiple contracts with the same tag (e.g. for Mobile use cases)](#verifying-multiple-contracts-with-the-same-tag-eg-for-mobile-use-cases)
      - [Modify Requests Prior to Verification (Request Filters)](#modify-requests-prior-to-verification-request-filters)
      - [Lifecycle of a provider verification](#lifecycle-of-a-provider-verification)
    - [Publishing Pacts to a Broker](#publishing-pacts-to-a-broker)
      - [Publish in npm scripts](#publish-in-npm-scripts)
      - [Publish in a custom script](#publish-in-a-custom-script)
        - [Pact publishing options](#pact-publishing-options)
      - [Publishing Verification Results to a Pact Broker](#publishing-verification-results-to-a-pact-broker)
  - [Asynchronous API Testing](#asynchronous-api-testing)
    - [Consumer](#consumer)
    - [Provider (Producer)](#provider-producer)
    - [Pact Broker Integration](#pact-broker-integration)
  - [Matching](#matching)
    - [Match common formats](#match-common-formats)
    - [Match based on type](#match-based-on-type)
    - [Match based on arrays](#match-based-on-arrays)
    - [Match by regular expression](#match-by-regular-expression)
  - [GraphQL API](#graphql-api)
  - [Tutorial (60 minutes)](#tutorial-60-minutes)
  - [Examples](#examples)
    - [HTTP APIs](#http-apis)
    - [Asynchronous APIs](#asynchronous-apis)
  - [Using Pact in non-Node environments](#using-pact-in-non-node-environments)
    - [Using Pact with Karma](#using-pact-with-karma)
    - [Using Pact with RequireJS](#using-pact-with-requirejs)
  - [Pact JS V3](#pact-js-v3)
    - [Using the V3 matching rules](#using-the-v3-matching-rules)
    - [Using Pact with XML](#using-pact-with-xml)
    - [Verifying providers with VerifierV3](#verifying-providers-with-verifierv3)
      - [Request Filters](#request-filters)
      - [Provider state callbacks](#provider-state-callbacks)
  - [Troubleshooting / FAQs](#troubleshooting--faqs)
    - [Alpine + Docker](#alpine--docker)
    - [Parallel tests](#parallel-tests)
    - [Splitting tests across multiple files](#splitting-tests-across-multiple-files)
    - [Test fails when it should pass](#test-fails-when-it-should-pass)
    - [Test intermittent failures](#test-intermittent-failures)
    - [Re-run specific verification failures](#re-run-specific-verification-failures)
    - [Timeout](#timeout)
    - [Usage with Jest](#usage-with-jest)
    - [Usage with Angular](#usage-with-angular)
    - [Debugging](#debugging)
  - [Contributing](#contributing)
  - [Contact](#contact)

<!-- /TOC -->

## Installation

```
npm i -S @pact-foundation/pact@latest
```

Make sure the `ignore-scripts` option is disabled, pact uses npm scripts to download further dependencies.

### Do Not Track

In order to get better statistics as to who is using Pact, we have an anonymous tracking event that triggers when Pact installs for the first time. The only things we [track](https://github.com/pact-foundation/pact-node/blob/master/standalone/install.ts#L132-L143) are your type of OS, and the version information for the package being installed. No PII data is sent as part of this request. To respect your privacy, you can disable tracking by simply adding a 'do not track' flag within your package.json file or setting the environment variable `PACT_DO_NOT_TRACK=1`:

```json
{
	"name": "some-project",
	...
	"config": {
		"pact_do_not_track": true
	},
	...
}
```

See the [Changelog] for versions and their history.

## Which Library/Package should I use?

TL;DR - you almost always want Pact JS.

| Purpose                   | Library  | Comments                                                                                                            |
| ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| Synchronous / HTTP APIs   | Pact JS  |                                                                                                                     |
| Asynchronous APIs         | Pact JS  |                                                                                                                     |
| Node.js                   | Pact JS  |                                                                                                                     |
| Browser testing           | Pact Web | You probably still want Pact JS. See [Using Pact in non-Node environments](#using-pact-in-non-node-environments) \* |
| Isomorphic testing        | Pact Web | You probably still want Pact JS. See [Using Pact in non-Node environments](#using-pact-in-non-node-environments) \* |
| Publishing to Pact Broker | Pact JS  |                                                                                                                     |

\* The "I need to run it in the browser" question comes up occasionally. The question is this - for your JS code to be able to make a call to another API, is this dependent on browser-specific code? In most cases, people use tools like React/Angular which have libraries that work on the server and client side, in which case, these tests don't need to run in a browser and could instead be executed in a Node.js environment.

## Using Pact JS

Pact supports [synchronous request-response style HTTP interactions](#http-api-testing) and [asynchronous interactions](#asynchronous-api-testing) with JSON-formatted payloads.

## HTTP API Testing

### Consumer Side Testing

To use the library on your tests, add the pact dependency:

```javascript
const { Pact } = require("@pact-foundation/pact")
```

The `Pact` class provides the following high-level APIs, they are listed in the order in which they typically get called in the lifecycle of testing a consumer:

#### API

<details><summary>Consumer API</summary>

| API                 | Options                       | Returns   | Description                                                                                                                                                                                                                                                  |
| ------------------- | ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `new Pact(options)` | See constructor options below | `Object`  | Creates a Mock Server test double of your Provider API. If you need multiple Providers for a scenario, you can create as many as these as you need.                                                                                                          |
| `setup()`           | n/a                           | `Promise` | Start the Mock Server and wait for it to be available. You would normally call this only once in a `beforeAll(...)` type clause                                                                                                                              |
| `addInteraction()`  | `Object`                      | `Promise` | Register an expectation on the Mock Server, which must be called by your test case(s). You can add multiple interactions per server, and each test would normally contain one or more of these. These will be validated and written to a pact if successful. |
| `verify()`          | n/a                           | `Promise` | Verifies that all interactions specified. This should be called once per test, to ensure your expectations were correct                                                                                                                                      |
| `finalize()`        | n/a                           | `Promise` | Records the interactions registered to the Mock Server into the pact file and shuts it down. You would normally call this only once in an `afterAll(...)` type clause.                                                                                       |

</details>

<details><summary>Constructor</summary>

| Parameter           | Required? | Type    | Description                                                                                              |
| ------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `consumer`          | yes       | string  | The name of the consumer                                                                                 |
| `provider`          | yes       | string  | The name of the provider                                                                                 |
| `port`              | no        | number  | The port to run the mock service on, defaults to 1234                                                    |
| `host`              | no        | string  | The host to run the mock service, defaults to 127.0.0.1                                                  |
| `ssl`               | no        | boolean | SSL flag to identify the protocol to be used (default false, HTTP)                                       |
| `sslcert`           | no        | string  | Path to SSL certificate to serve on the mock service                                                     |
| `sslkey`            | no        | string  | Path to SSL key to serve on the mock service                                                             |
| `dir`               | no        | string  | Directory to output pact files                                                                           |
| `log`               | no        | string  | File to log to                                                                                           |
| `logLevel`          | no        | string  | Log level: one of 'trace', 'debug', 'info', 'error', 'fatal' or 'warn'                                   |
| `spec`              | no        | number  | Pact specification version (defaults to 2)                                                               |
| `cors`              | no        | boolean | Allow CORS OPTION requests to be accepted, defaults to false                                             |
| `pactfileWriteMode` | no        | string  | Control how the Pact files are written. Choices: 'overwrite' 'update' or 'none'. Defaults to 'overwrite' |
| `timeout`           | no        | number  | The time to wait for the mock server to start up in milliseconds. Defaults to 30 seconds (30000)       |

</details>

#### Example

The first step is to create a test for your API Consumer. The example below uses [Mocha](https://mochajs.org), and demonstrates the basic approach:

1.  Create the Pact object
1.  Start the Mock Provider that will stand in for your actual Provider
1.  Add the interactions you expect your consumer code to make when executing the tests
1.  Write your tests - the important thing here is that you test the outbound _collaborating_ function which calls the Provider, and not just issue raw http requests to the Provider. This ensures you are testing your actual running code, just like you would in any other unit test, and that the tests will always remain up to date with what your consumer is doing.
1.  Validate the expected interactions were made between your consumer and the Mock Service
1.  Generate the pact(s)

Check out the `examples` folder for examples with Karma Jasmine, Mocha and Jest. The example below is taken from the [integration spec](https://github.com/pact-foundation/pact-js/blob/master/src/pact.integration.spec.ts).

```javascript
const path = require("path")
const chai = require("chai")
const { Pact } = require("@pact-foundation/pact")
const chaiAsPromised = require("chai-as-promised")
const expect = chai.expect

chai.use(chaiAsPromised)

describe("Pact", () => {
  // (1) Create the Pact object to represent your provider
  const provider = new Pact({
    consumer: "TodoApp",
    provider: "TodoService",
    port: 1234,
    log: path.resolve(process.cwd(), "logs", "pact.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    logLevel: "INFO",
  })

  // this is the response you expect from your Provider
  const EXPECTED_BODY = [
    {
      id: 1,
      name: "Project 1",
      due: "2016-02-11T09:46:56.023Z",
      tasks: [
        { id: 1, name: "Do the laundry", done: true },
        { id: 2, name: "Do the dishes", done: false },
        { id: 3, name: "Do the backyard", done: false },
        { id: 4, name: "Do nothing", done: false },
      ],
    },
  ]

  const todoApp = new TodoApp()

  context("when there are a list of projects", () => {
    describe("and there is a valid user session", () => {
      before(() =>
        provider
          // (2) Start the mock server
          .setup()
          // (3) add interactions to the Mock Server, as many as required
          .then(() =>
            provider.addInteraction({
              // The 'state' field specifies a "Provider State"
              state: "i have a list of projects",
              uponReceiving: "a request for projects",
              withRequest: {
                method: "GET",
                path: "/projects",
                headers: { Accept: "application/json" },
              },
              willRespondWith: {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: EXPECTED_BODY,
              },
            })
          )
      )
    })

    // (4) write your test(s)
    it("generates a list of TODOs for the main screen", async () => {
      const projects = await todoApp.getProjects() // <- this method would make the remote http call
      expect(projects).to.be.a("array")
      expect(projects).to.have.deep.property("projects[0].id", 1)
    })

    // (5) validate the interactions you've registered and expected occurred
    // this will throw an error if it fails telling you what went wrong
    // This should be performed once per interaction test
    afterEach(() => provider.verify())
  })

  // (6) write the pact file for this consumer-provider pair,
  // and shutdown the associated mock server.
  // You should do this only _once_ per Provider you are testing,
  // and after _all_ tests have run for that suite
  after(() => provider.finalize())
})
```

### Provider API Testing

<details><summary>Provider API</summary>

Once you have created Pacts for your Consumer, you need to validate those Pacts against your Provider. The Verifier object provides the following API for you to do so:

| API                |  Options  | Returns   | Description           |
| ------------------ | :-------: | --------- | --------------------- |
| `verifyProvider()` | See below | `Promise` | Start the Mock Server |

</details>

1.  Start your local Provider service.
1.  Optionally, instrument your API with ability to configure [provider states](https://github.com/pact-foundation/pact-provider-verifier/)
1.  Then run the Provider side verification step

```js
const { Verifier } = require('@pact-foundation/pact');
let opts = {
  ...
};

new Verifier(opts).verifyProvider().then(function () {
	// do something
});
```

#### Verification Options

<details><summary>Verification Options</summary>

| Parameter                   | Required? | Type                           | Description                                                                                                                                                                                        |
| --------------------------- | --------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `providerBaseUrl`           | true      | string                         | Running API provider host endpoint.                                                                                                                                                                |
| `pactBrokerUrl`             | false     | string                         | Base URL of the Pact Broker from which to retrieve the pacts. Required if `pactUrls` not given.                                                                                                    |
| `provider`                  | false     | string                         | Name of the provider if fetching from a Broker                                                                                                                                                     |
| `consumerVersionSelectors`  | false     | ConsumerVersionSelector\|array | Using [Selectors](https://docs.pact.io/pact_broker/advanced_topics/consumer_version_selectors/) is a way we specify which pacticipants and versions we want to use when configuring verifications. |
| `consumerVersionTags`       | false     | string\|array                  | Retrieve the latest pacts with given tag(s)                                                                                                                                                        |
| `providerVersionTags`       | false     | string\|array                  | Tag(s) to apply to the provider application                                                                                                                                                        |
| `includeWipPactsSince`      | false     | string                         | Includes pact marked as WIP since this date. String in the format %Y-%m-%d or %Y-%m-%dT%H:%M:%S.000%:z                                                                                             |
| `pactUrls`                  | false     | array                          | Array of local pact file paths or HTTP-based URLs. Required if _not_ using a Pact Broker.                                                                                                          |
| `providerStatesSetupUrl`    | false     | string                         | Deprecated (use URL to send PUT requests to setup a given provider state                                                                                                                           |
| `stateHandlers`             | false     | object                         | Map of "state" to a function that sets up a given provider state. See docs below for more information                                                                                              |
| `requestFilter`             | false     | function                       | Function that may be used to alter the incoming request or outgoing response from the verification process. See below for use.                                                                     |
| `beforeEach`                | false     | function                       | Function to execute prior to each interaction being validated                                                                                                                                      |
| `afterEach`                 | false     | function                       | Function to execute after each interaction has been validated                                                                                                                                      |
| `pactBrokerUsername`        | false     | string                         | Username for Pact Broker basic authentication                                                                                                                                                      |
| `pactBrokerPassword`        | false     | string                         | Password for Pact Broker basic authentication                                                                                                                                                      |
| `pactBrokerToken`           | false     | string                         | Bearer token for Pact Broker authentication                                                                                                                                                        |
| `publishVerificationResult` | false     | boolean                        | Publish verification result to Broker (_NOTE_: you should only enable this during CI builds)                                                                                                       |
| `customProviderHeaders`     | false     | array                          | Header(s) to add to provider state set up and pact verification                                                                                                                                    |  | `requests`. eg 'Authorization: Basic cGFjdDpwYWN0'. |
| `providerVersion`           | false     | string                         | Provider version, required to publish verification result to Broker. Optional otherwise.                                                                                                           |
| `enablePending`             | false     | boolean                        | Enable the [pending pacts](https://docs.pact.io/pending) feature.                                                                                                                                  |
| `timeout`                   | false     | number                         | The duration in ms we should wait to confirm verification process was successful. Defaults to 30000.                                                                                               |
| `format`                    | false     | string                         | What format the verification results are printed in. Options are `json`, `xml`, `progress` and `RspecJunitFormatter` (which is a synonym for `xml`)                                                |
| `verbose`                   | false     | boolean                        | Enables verbose output for underlying pact binary.                                                                                                                                                 |

</details>

To dynamically retrieve pacts from a Pact Broker for a provider, provide the broker URL, the name of the provider, and the consumer version tags that you want to verify:

```js
let opts = {
  pactBroker: "http://my-broker",
  provider: "Animal Profile Service",
  consumerVersionTags: ["master", "test", "prod"],
}
```

To verify a pact at a specific URL (eg. when running a pact verification triggered by a 'contract content changed' webhook, or when verifying a pact from your local machine, or a network location that's not the Pact Broker, set just the `pactUrls`, eg:

```js
let opts = {
  pactUrls: [process.env.PACT_URL],
}
```

To publish the verification results back to the Pact Broker, you need to enable the 'publish' flag, set the provider version and optional provider version tags:

```js
let opts = {
  publishVerificationResult: true, //generally you'd do something like `process.env.CI === 'true'`
  providerVersion: "version", //recommended to be the git sha
  providerVersionTags: ["tag"], //optional, recommended to be the git branch
}
```

If your broker has a self signed certificate, set the environment variable `SSL_CERT_FILE` (or `SSL_CERT_DIR`) pointing to a copy of your certificate.

Read more about [Verifying Pacts](https://docs.pact.io/getting_started/verifying_pacts).

#### API with Provider States

If you have defined any `state`s in your consumer tests, the `Verifier` can put the provider into the right state prior to sending the request. For example, the provider can use the state to mock away certain database queries. To support this, set up a handler for each `state` using hooks on the `stateHandlers` property. Here is an example from our [e2e suite](https://github.com/pact-foundation/pact-js/blob/master/examples/e2e/test/provider.spec.js):

```js
const opts = {
  ...
  stateHandlers: {
    [null]: () => {
      // This is the "default" state handler, when no state is given
    }
    "Has no animals": () => {
      animalRepository.clear()
      return Promise.resolve(`Animals removed from the db`)
    },
    "Has some animals": () => {
      importData()
      return Promise.resolve(`Animals added to the db`)
    },
    "Has an animal with ID 1": () => {
      importData()
      return Promise.resolve(`Animals added to the db`)
    }
  }
}

return new Verifier(opts).verifyProvider().then(...)
```

As you can see, for each state ("Has no animals", ...), we configure the local datastore differently. If this option is not configured, the `Verifier` will ignore the provider states defined in the pact and log a warning.

Read more about [Provider States](https://docs.pact.io/getting_started/provider_states).

#### Before and After Hooks

Sometimes, it's useful to be able to do things before or after a test has run, such as reset a database, log a metric etc. A `beforeEach` hook runs on each verification before any other part of the Pact test lifecycle, and a `afterEach` hook runs as the last step before returning the verification result back to the test.

You can add them to your verification options as follows:

```js
const opts = {
  ...
  beforeEach: () => {
    console.log('I run before everything else')
  },

  afterEach: () => {
    console.log('I run after everything else has finished')
  }
}
```

If the hook errors, the test will fail. See the lifecycle of an interaction below.

#### Pending Pacts

_NOTE_: This feature is available on [Pactflow] by default, and requires [configuration](https://docs.pact.io/pact_broker/advanced_topics/wip_pacts) if using a self-hosted broker.

Pending pacts is a feature that allows consumers to publish new contracts or changes to existing contracts without breaking Provider's builds. It does so by flagging the contract as "unverified" in the Pact Broker the first time a contract is published. A Provider can then enable a behaviour (via `enablePending: true`) that will still perform a verification (and thus share the results back to the broker) but _not_ fail the verification step itself.

This enables safe introduction of new contracts into the system, without breaking Provider builds, whilst still providing feedback to Consumers as per before.

See the [docs](https://docs.pact.io/pending) and this [article](http://blog.pact.io/2020/02/24/how-we-have-fixed-the-biggest-problem-with-the-pact-workflow/) for more background.

#### WIP Pacts

_NOTE_: This feature is available on [Pactflow] by default, and requires [configuration](https://docs.pact.io/pact_broker/advanced_topics/wip_pacts) if using a self-hosted broker.

WIP Pacts builds upon pending pacts, enabling provider tests to pull in _any_ contracts applicable to the provider regardless of the `tag` it was given. This is useful, because often times consumers won't follow the exact same tagging convention and so their workflow would be interrupted. This feature enables any pacts determined to be "work in progress" to be verified by the Provider, without causing a build failure. You can enable this behaviour by specifying a valid timestamp for `includeWipPactsSince`. This sets the start window for which new WIP pacts will be pulled down for verification, regardless of the tag.

See the [docs](https://docs.pact.io/wip) and this [article](http://blog.pact.io/2020/02/24/introducing-wip-pacts/) for more background.

#### Verifying multiple contracts with the same tag (e.g. for Mobile use cases)

Tags may be used to indicate a particular version of an application has been deployed to an environment - e.g. `prod`, and are critical in configuring can-i-deploy checks for CI/CD pipelines. In the majority of cases, only one version of an application is deployed to an environment at a time. For example, an API and a Website are usually deployed in replacement of an existing system, and any transition period is quite short lived.

Mobile is an exception to this rule - it is common to have multiple versions of an application that are in "production" simultaneously. To support this workflow, we have a feature known as [consumer version selectors](https://docs.pact.io/pact_broker/advanced_topics/consumer_version_selectors/). Using selectors, we can verify that _all_ pacts with a given tag should be verified. The following selectors ask the broker to "find all pacts with tag 'prod' and the latest pact for 'master'":

```js
consumerVersionSelectors: [
  {
    tag: "prod",
    all: true,
  },
  {
    tag: "master",
    latest: true,
  },
]
```

_NOTE: Using the `all` flag requires you to ensure you delete any tags associated with application versions that are no longer in production (e.g. if decommissioned from the app store)_

#### Modify Requests Prior to Verification (Request Filters)

Sometimes you may need to add things to the requests that can't be persisted in a pact file. Examples of these are authentication tokens with a small life span. e.g. an OAuth bearer token: `Authorization: Bearer 0b79bab50daca910b000d4f1a2b675d604257e42`.

For these cases, we have two facilities that should be carefully used during verification:

1. the ability to specify custom headers to be sent during provider verification. The flag to achieve this is `customProviderHeaders`.
2. the ability to modify a request/response and modify the payload. The flag to achieve this is `requestFilter`.

**Example API with Authorization**

For example, to have an `Authorization` bearer token header sent as part of the verification request, set the `verifyProvider` options as per below:

```js
let token
let opts = {
  provider: 'Animal Profile Service',
  ...
  stateHandlers: {
    "is authenticated": () => {
      token = "1234"
      Promise.resolve(`Valid bearer token generated`)
    },
    "is not authenticated": () => {
      token = ""
      Promise.resolve(`Expired bearer token generated`)
    }
  },

  // this middleware is executed for each request, allowing `token` to change between invocations
  // it is common to pair this with `stateHandlers` as per above, that can set/expire the token
  // for different test cases
  requestFilter: (req, res, next) => {
    req.headers["Authorization"] = `Bearer: ${token}`
    next()
  },

  // This header will always be sent for each and every request, and can't be dynamic
  // (i.e. passing a variable instead of the bearer token)
  customProviderHeaders: ["Authorization: Bearer 1234"]
}

return new Verifier(opts).verifyProvider().then(...)
```

As you can see, this is your opportunity to modify\add to headers being sent to the Provider API, for example to create a valid time-bound token.

_Important Note_: You should only use this feature for things that can not be persisted in the pact file. By modifying the request, you are potentially modifying the contract from the consumer tests!

#### Lifecycle of a provider verification

For each _interaction_ in a pact file, the order of execution is as follows:

`BeforeEach` -> `State Handler` -> `Request Filter (request phase)` -> `Execute Provider Test` -> `Request Filter (response phase)` -> `AfterEach`

If any of the middleware or hooks fail, the tests will also fail.

### Publishing Pacts to a Broker

Sharing is caring - to simplify sharing Pacts between Consumers and Providers, we have created the [Pact Broker](https://pactflow.io).

The Broker:

- versions your contracts
- tells you which versions of your applications can be deployed safely together
- allows you to deploy your services independently
- provides API documentation of your applications that is guaranteed to be up-to date
- visualises the relationships between your services
- integrates with other systems, such as Slack or your CI server, via webhooks
- ...and much much [more](https://docs.pact.io/getting_started/sharing_pacts).

[Host your own](https://github.com/pact-foundation/pact_broker), or signup for a free hosted [Pact Broker](https://pactflow.io).

#### Publish in npm scripts

The easiest way to publish pacts to the broker is via an npm script in your package.json:

```

   "pact:publish": "pact-broker publish <YOUR_PACT_FILES_OR_DIR> --consumer-app-version=\"$(npx @pact-foundation/absolute-version)\" --tag-with-git-branch --broker-base-url=https://your-broker-url.example.com"
```

For a full list of the options, see the [CLI usage instructions](https://github.com/pact-foundation/pact-ruby-standalone/releases).
All CLI binaries are available in npm scripts when using pact-js.

If you want to pass your username and password to the broker without including
them in scripts, you can provide it via the environment variables
`PACT_BROKER_USERNAME` and `PACT_BROKER_PASSWORD`. If your broker supports an
access token instead of a password, use the environment variable
`PACT_BROKER_TOKEN`.

#### Publish in a custom script

If you require finer control over your pact publication, you can programatically publish in a custom script:

```js
const { Publisher } = require("@pact-foundation/pact")
const opts = {
   ...
};

new Publisher(opts)
  .publishPacts()
  .then(() => {
    // ...
  })
```

#### Pact publishing options

<details><summary>Publishing Options</summary>

| Parameter            | Required | Type             | Description                                                                                                                                                 |
| -------------------- | :------: | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `providerBaseUrl`    | `false`  | string           | Running API provider host endpoint.                                                                                                                         |
| `pactFilesOrDirs`    |  `true`  | array of strings | Array of local Pact files or directories containing pact files. Path must be absolute. Required.                                                            |
| `pactBroker`         |  `true`  | string           | The base URL of the Pact Broker. eg. https://test.pact.dius.com.au. Required.                                                                               |
| `pactBrokerToken`    | `false`  | string           | Bearer token for Pact Broker authentication. Optional. If using Pactflow, you likely need this option                                                       |
| `pactBrokerUsername` | `false`  | string           | Username for Pact Broker basic authentication. Optional. If using Pactflow, you most likely need to use `pactBrokerToken`                                   |
| `pactBrokerPassword` | `false`  | string           | Password for Pact Broker basic authentication. Optional. If using Pactflow, you most likely need to use `pactBrokerToken`                                   |
| `consumerVersion`    |  `true`  | string           | The consumer application version; e.g. '1.0.0-cac389f'. ([See more info on versioning](https://docs.pact.io/getting_started/versioning_in_the_pact_broker)) |
| `tags`               | `false`  | array of strings | Tag your pacts, often used with your branching, release or environment strategy e.g. ['prod', 'test']                                                       |

</details>

If your broker has a self signed certificate, set the environment variable `SSL_CERT_FILE` (or `SSL_CERT_DIR`) pointing to a copy of your certificate.

#### Publishing Verification Results to a Pact Broker

If you're using a Pact Broker (e.g. a hosted one at https://pactflow.io), you can
publish your verification results so that consumers can query if they are safe
to release.

It looks like this:

![screenshot of verification result](https://cloud.githubusercontent.com/assets/53900/25884085/2066d98e-3593-11e7-82af-3b41a20af8e5.png)

To publish the verification results back to the Pact Broker, you need to enable the 'publish' flag, set the provider version and optional provider version tags:

```js
let opts = {
  publishVerificationResult: true, //recommended to only publish from CI by setting the value to `process.env.CI === 'true'`
  providerVersion: "version", //recommended to be the git sha eg. process.env.MY_CI_COMMIT
  providerVersionTags: ["tag"], //optional, recommended to be the git branch eg. process.env.MY_CI_BRANCH
}
```

## Asynchronous API Testing

_Since version `v6.0.0` or later_

Modern distributed architectures are increasingly integrated in a decoupled, asynchronous fashion. Message queues such as ActiveMQ, RabbitMQ, SQS, Kafka and Kinesis are common, often integrated via small and frequent numbers of microservices (e.g. lambda.).

Furthermore, the web has things like WebSockets which involve bidirectional messaging.

Pact supports these use cases, by abstracting away the protocol and focussing on the messages passing between them.

For further reading and introduction into this topic, see this [article](https://dius.com.au/2017/09/22/contract-testing-serverless-and-asynchronous-applications/)
and our [asynchronous examples](#asynchronous-apis) for a more detailed overview of these concepts.

### Consumer

A Consumer is the system that will be reading a message from a queue or some other intermediary - like a DynamoDB table or S3 bucket -
and be able to handle it.

From a Pact testing point of view, Pact takes the place of the intermediary (MQ/broker etc.) and confirms whether or not the consumer is able to handle a request.

The following test creates a contract for a Dog API handler:

```js
const path = require("path")
const {
  MessageConsumerPact,
  synchronousBodyHandler,
} = require("@pact-foundation/pact")

// 1 Dog API Handler
const dogApiHandler = function(dog) {
  if (!dog.id && !dog.name && !dog.type) {
    throw new Error("missing fields")
  }

  // do some other things to dog...
  // e.g. dogRepository.save(dog)
  return
}

// 2 Pact Message Consumer
const messagePact = new MessageConsumerPact({
  consumer: "MyJSMessageConsumer",
  dir: path.resolve(process.cwd(), "pacts"),
  pactfileWriteMode: "update",
  provider: "MyJSMessageProvider",
})

describe("receive dog event", () => {
  it("accepts a valid dog", () => {
    // 3 Consumer expectations
    return (
      messagePact
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

1.  The Dog API - a contrived API handler example. Expects a dog object and throws an `Error` if it can't handle it.
    - In most applications, some form of transactionality exists and communication with a MQ/broker happens.
    - It's important we separate out the protocol bits from the message handling bits, so that we can test that in isolation.
1.  Creates the MessageConsumer class
1.  Setup the expectations for the consumer - here we expect a `dog` object with three fields
1.  Pact will send the message to your message handler. If the handler returns a successful promise, the message is saved, otherwise the test fails. There are a few key things to consider:
    - The actual request body that Pact will send, will be contained within a [Message](https://github.com/pact-foundation/pact-js/tree/master/src/dsl/message.ts) object along with other context, so the body must be retrieved via `content` attribute.
    - All handlers to be tested must be of the shape `(m: Message) => Promise<any>` - that is, they must accept a `Message` and return a `Promise`. This is how we get around all of the various protocols, and will often require a lightweight adapter function to convert it.
    - In this case, we wrap the actual dogApiHandler with a convenience function `synchronousBodyHandler` provided by Pact, which Promisifies the handler and extracts the contents.

### Provider (Producer)

A Provider (Producer in messaging parlance) is the system that will be putting a message onto the queue.

As per the Consumer case, Pact takes the position of the intermediary (MQ/broker) and checks to see whether or not the Provider sends a message that matches the Consumer's expectations.

```js
const path = require("path")
const { MessageProviderPact } = require("@pact-foundation/pact")

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
    it("sends some dogs", () => {
      return p.verify()
    })
  })
})
```

**Explanation**:

1.  Our API client contains a single function `createDog` which is responsible for generating the message that will be sent to the consumer via some message queue
1.  We configure Pact to stand-in for the queue. The most important bit here is the `messageProviders` block
    - Similar to the Consumer tests, we map the various interactions that are going to be verified as denoted by their `description` field. In this case, `a request for a dog`, maps to the `createDog` handler. Notice how this matches the original Consumer test.
1.  We can now run the verification process. Pact will read all of the interactions specified by its consumer, and invoke each function that is responsible for generating that message.

### Pact Broker Integration

As per HTTP APIs, you can [publish contracts and verification results to a Broker](#publishing-pacts-to-a-broker).

## Matching

Matching makes your tests more expressive making your tests less brittle.

Rather than use hard-coded values which must then be present on the Provider side,
you can use regular expressions and type matches on objects and arrays to validate the
structure of your APIs.

_NOTE: Make sure to start the mock service via the `Pact` declaration with the option `specification: 2` to get access to these features._

### Match common formats

Often times, you find yourself having to re-write regular expressions for common formats. We've created a number of them for you to save you the time:

<details><summary>Matchers API</summary>

| method                      | description                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `boolean`                   | Match a boolean value (using equality)                                                                                      |
| `string`                    | Match a string value                                                                                                        |
| `integer`                   | Will match all numbers that are integers (both ints and longs)                                                              |
| `decimal`                   | Will match all real numbers (floating point and decimal)                                                                    |
| `hexadecimal`               | Will match all hexadecimal encoded strings                                                                                  |
| `iso8601Date`               | Will match string containing basic ISO8601 dates (e.g. 2016-01-01)                                                          |
| `iso8601DateTime`           | Will match string containing ISO 8601 formatted dates (e.g. 2015-08-06T16:53:10+01:00)                                      |
| `iso8601DateTimeWithMillis` | Will match string containing ISO 8601 formatted dates, enforcing millisecond precision (e.g. 2015-08-06T16:53:10.123+01:00) |
| `rfc3339Timestamp`          | Will match a string containing an RFC3339 formatted timestapm (e.g. Mon, 31 Oct 2016 15:21:41 -0400)                        |
| `iso8601Time`               | Will match string containing times (e.g. T22:44:30.652Z)                                                                    |
| `ipv4Address`               | Will match string containing IP4 formatted address                                                                          |
| `ipv6Address`               | Will match string containing IP6 formatted address                                                                          |
| `uuid`                      | Will match strings containing UUIDs                                                                                         |
| `email`                     | Will match strings containing Email address                                                                                 |

</details>

### Match based on type

```javascript
const { like, string } = Matchers

provider.addInteraction({
  state: "Has some animals",
  uponReceiving: "a request for an animal",
  withRequest: {
    method: "GET",
    path: "/animals/1",
  },
  willRespondWith: {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: {
      id: 1,
      name: string("Billy"),
      address: like({
        street: "123 Smith St",
        suburb: "Smithsville",
        postcode: 7777,
      }),
    },
  },
})
```

Note that you can wrap a `like` around a single value or an object. When wrapped around an object, all values and child object values will be matched according to types, unless overridden by something more specific like a `term`.

[flexible-matching]: https://github.com/realestate-com-au/pact/wiki/Regular-expressions-and-type-matching-with-Pact

### Match based on arrays

Matching provides the ability to specify flexible length arrays. For example:

```javascript
pact.eachLike(obj, { min: 3 })
```

Where `obj` can be any javascript object, value or Pact.Match. It takes optional argument (`{ min: 3 }`) where min is greater than 0 and defaults to 1 if not provided.

Below is an example that uses all of the Pact Matchers.

```javascript
const { somethingLike: like, term, eachLike } = pact

const animalBodyExpectation = {
  id: 1,
  first_name: "Billy",
  last_name: "Goat",
  animal: "goat",
  age: 21,
  gender: term({
    matcher: "F|M",
    generate: "M",
  }),
  location: {
    description: "Melbourne Zoo",
    country: "Australia",
    post_code: 3000,
  },
  eligibility: {
    available: true,
    previously_married: false,
  },
  children: eachLike({ name: "Sally", age: 2 }),
}

// Define animal list payload, reusing existing object matcher
// Note that using eachLike ensure that all values are matched by type
const animalListExpectation = eachLike(animalBodyExpectation, {
  min: MIN_ANIMALS,
})

provider.addInteraction({
  state: "Has some animals",
  uponReceiving: "a request for all animals",
  withRequest: {
    method: "GET",
    path: "/animals/available",
  },
  willRespondWith: {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: animalListExpectation,
  },
})
```

### Match by regular expression

If none of the above matchers or formats work, you can write your own regex matcher.

The underlying mock service is written in Ruby, so the regular expression must be in a Ruby format, not a Javascript format.

```javascript
const { term } = pact

provider.addInteraction({
  state: "Has some animals",
  uponReceiving: "a request for an animal",
  withRequest: {
    method: "GET",
    path: "/animals/1",
  },
  willRespondWith: {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: {
      id: 100,
      name: "billy",
      gender: term({
        matcher: "F|M",
        generate: "F",
      }),
    },
  },
})
```

## GraphQL API

GraphQL is simply an abstraction over HTTP and may be tested via Pact. There are two wrapper APIs available for GraphQL specific testing: `GraphQLInteraction` and `ApolloGraphQLInteraction`.

These are both lightweight wrappers over the standard DSL in order to make GraphQL testing a bit nicer.

See the [history](https://github.com/pact-foundation/pact-js/issues/254#issuecomment-442185695), and below for an example.

## Tutorial (60 minutes)

Learn everything in Pact JS in 60 minutes: https://github.com/pact-foundation/pact-workshop-js.

The workshop takes you through all of the key concepts using a React consumer and an Express API.

## Examples

### HTTP APIs

- [Complete Example (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/e2e)
- [Pact with AVA (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/ava)
- [Pact with Jest (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/jest)
- [Pact with TypeScript + Mocha](https://github.com/pact-foundation/pact-js/tree/master/examples/typescript)
- [Pact with Mocha](https://github.com/pact-foundation/pact-js/tree/master/examples/mocha)
- [Pact with GraphQL](https://github.com/pact-foundation/pact-js/tree/master/examples/graphql)
- [Pact with Karma + Jasmine](https://github.com/pact-foundation/pact-js/tree/master/examples/karma/jasmine)
- [Pact with Karma + Mocha](https://github.com/pact-foundation/pact-js/tree/master/examples/karma/mocha)
- [Pact with React + Jest](https://github.com/pact-foundation/pact-workshop-js)

### Asynchronous APIs

- [Asynchronous messages](https://github.com/pact-foundation/pact-js/tree/master/examples/messages)
- [Serverless](https://github.com/pact-foundation/pact-js/tree/master/examples/serverless)

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
  baseUrl: "/base",
  paths: {
    Pact: "node_modules/pact-web/pact-web",
    client: "js/client",
  },
  deps: allTestFiles,
  callback: window.__karma__.start,
})
```

See this [Stack Overflow](https://stackoverflow.com/a/44170373/1008568) question for background, and
this [gist](https://gist.github.com/mefellows/15c9fcb052c2aa9d8951f91d48d6da54) with a working example.

## Pact JS V3

An initial alpha version of Pact-JS with support for V3 specification features and XML matching has
been released. Current support is for Node 10, 12 and 14. Thanks to the folks at [Align Tech](https://www.aligntech.com/) for sponsoring this work.

To install it:

```console
npm i @pact-foundation/pact@beta
```

For examples on how to use it, see [examples/v3/e2e](https://github.com/pact-foundation/pact-js/tree/feat/v3.0.0/examples/v3/e2e) and [examples/v3/todo-consumer](https://github.com/pact-foundation/pact-js/tree/feat/v3.0.0/examples/v3/todo-consumer) in the `v3.0.0` branch.

**NOTE: The API of this implementation is likely to change. See this [discussion](https://github.com/pact-foundation/pact-js/discussions/681) for more**

### Using the V3 matching rules

There are a number of new matchers that can be used, like `integer` and `timestamp`. There are defined in the `MatchersV3` class that needs to be used with `PactV3` DSL.

For example:

```javascript
const { PactV3, MatchersV3 } = require("@pact-foundation/pact/v3")
const {
  eachLike,
  atLeastLike,
  integer,
  timestamp,
  boolean,
  string,
  regex,
  like,
} = MatchersV3

const animalBodyExpectation = {
  id: integer(1),
  available_from: timestamp("yyyy-MM-dd'T'HH:mm:ss.SSSX"),
  first_name: string("Billy"),
  last_name: string("Goat"),
  animal: string("goat"),
  age: integer(21),
  gender: regex("F|M", "M"),
  location: {
    description: string("Melbourne Zoo"),
    country: string("Australia"),
    post_code: integer(3000),
  },
  eligibility: {
    available: boolean(true),
    previously_married: boolean(false),
  },
  interests: eachLike("walks in the garden/meadow"),
}
```

| Matcher                | Parameters                                         | Description                                                                                                                                                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `like`                 | template                                           | Applies the `type` matcher to value, which requires values to have the same type as the template                                                                                                                                                                                                                                        |
| `eachLike`             | template                                           | Applies the `type` matcher to each value in an array, ensuring they match the template. Note that this matcher does not validate the length of the array, and the items within it                                                                                                                                                       |
| `atLeastOneLike`       | template, count: number = 1                        | Behaves like the `eachLike` matcher, but also applies a minimum length validation of one on the length of the array. The optional `count` parameter controls the number of examples generated.                                                                                                                                          |
| `atLeastLike`          | template, min: number, count?: number              | Just like `atLeastOneLike`, but the minimum length is configurable.                                                                                                                                                                                                                                                                     |
| `atMostLike`           | template, max: number, count?: number              | Behaves like the `eachLike` matcher, but also applies a maximum length validation on the length of the array. The optional `count` parameter controls the number of examples generated.                                                                                                                                                 |
| `constrainedArrayLike` | template, min: number, max: number, count?: number | Behaves like the `eachLike` matcher, but also applies a minimum and maximum length validation on the length of the array. The optional `count` parameter controls the number of examples generated.                                                                                                                                     |
| `boolean`              | example: boolean                                   | Matches boolean values (true, false)                                                                                                                                                                                                                                                                                                    |
| `integer`              | example?: number                                   | Value that must be an integer (must be a number and have no decimal places). If the example value is omitted, a V3 Random number generator will be used.                                                                                                                                                                                |
| `decimal`              | example?: number                                   | Value that must be a decimal number (must be a number and have at least one digit in the decimal places). If the example value is omitted, a V3 Random number generator will be used.                                                                                                                                                   |
| `number`               | example?: number                                   | Value that must be a number. If the example value is omitted, a V3 Random number generator will be used.                                                                                                                                                                                                                                |
| `string`               | example: string                                    | Value that must be a string.                                                                                                                                                                                                                                                                                                            |
| `regex`                | pattern, example: string                           | Value that must match the given regular expression.                                                                                                                                                                                                                                                                                     |
| `equal`                | example                                            | Value that must be equal to the example. This is mainly used to reset the matching rules which cascade.                                                                                                                                                                                                                                 |
| `timestamp`            | format: string, example?: string                   | String value that must match the provided datetime format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html) for details on the format string. If the example value is omitted, a value will be generated using a Timestamp generator and the current system date and time. |
| `time`                 | format: string, example?: string                   | String value that must match the provided time format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html) for details on the format string. If the example value is omitted, a value will be generated using a Time generator and the current system time.                   |
| `date`                 | format: string, example?: string                   | String value that must match the provided date format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html) for details on the format string. If the example value is omitted, a value will be generated using a Date generator and the current system date.                   |
| `includes`             | value: string                                      | Value that must include the example value as a substring.                                                                                                                                                                                                                                                                               |
| `nullValue`            |                                                    | Value that must be null. This will only match the JSON Null value. For other content types, it will match if the attribute is missing.                                                                                                                                                                                                  |

### Using Pact with XML

You can write both consumer and provider verification tests with XML requests or responses. For an example, see [examples/v3/todo-consumer/test/consumer.spec.js](https://github.com/pact-foundation/pact-js/blob/feat/v3.0.0/examples/v3/todo-consumer/test/consumer.spec.js).
There is an `XmlBuilder` class that provides a DSL to help construct XML bodies with matching rules and generators (NOTE that generators are not supported for XML at this time).

for example:

```javascript
body: new XmlBuilder("1.0", "UTF-8", "ns1:projects").build(el => {
  el.setAttributes({
    id: "1234",
    "xmlns:ns1": "http://some.namespace/and/more/stuff",
  })
  el.eachLike(
    "ns1:project",
    {
      id: integer(1),
      type: "activity",
      name: string("Project 1"),
      due: timestamp("yyyy-MM-dd'T'HH:mm:ss.SZ", "2016-02-11T09:46:56.023Z"),
    },
    project => {
      project.appendElement("ns1:tasks", {}, task => {
        task.eachLike(
          "ns1:task",
          {
            id: integer(1),
            name: string("Task 1"),
            done: boolean(true),
          },
          null,
          { examples: 5 }
        )
      })
    },
    { examples: 2 }
  )
})
```

### Verifying providers with VerifierV3

The `VerifierV3` class can verify your provider in a similar way to the existing one.

#### Request Filters

Request filters now take a request object as a parameter, and need to return the mutated one.

```javascript
requestFilter: req => {
    req.headers["MY_SPECIAL_HEADER"] = "my special value"

    // e.g. ADD Bearer token
    req.headers["authorization"] = `Bearer ${token}`

    // Need to return the request back again
    return req
},
```

#### Provider state callbacks

Provider state callbacks have been updated to support parameters and return values. The first parameter is a boolean indicating whether it is a setup call
(run before the verification) or a tear down call (run afterwards). The second optional parameter is a key-value map of any parameters defined in the
pact file. Provider state callbacks can also return a map of key-value values. These are used with provider-state injected values, but support for that
will be added in a later release.

```javascript
stateHandlers: {
  "Has no animals": setup => {
    if (setup) {
      animalRepository.clear()
      return Promise.resolve({ description: `Animals removed to the db` })
    }
  },
  "Has some animals": setup => {
    if (setup) {
      importData()
      return Promise.resolve({
        description: `Animals added to the db`,
        count: animalRepository.count(),
      })
    }
  },
  "Has an animal with ID": (setup, parameters) => {
    if (setup) {
      importData()
      animalRepository.first().id = parameters.id
      return Promise.resolve({
        description: `Animal with ID ${parameters.id} added to the db`,
        id: parameters.id,
      })
    }
  },
```

### Debugging issues with Pact-JS V3

You can change the log levels using the `LOG_LEVEL` environment variable.

## Troubleshooting / FAQs

If you are having issues, a good place to start is setting `logLevel: 'debug'` when configuring the `new Pact({...})` object. This will give you detailed in/out requests as far as Pact sees them during verification.

### Alpine + Docker

See https://docs.pact.io/docker/.

### Parallel tests

Pact tests are inherently stateful, as we need to keep track of the interactions on a per-test basis, to ensure each contract is validated in isolation from others. However, in larger test suites, this can result in slower test execution.

Modern testing frameworks like Ava and Jest support parallel execution out-of-the-box, which

The good news is, parallel test execution is possible, you need to ensure that:

1.  Before any test run invocation, you remove any existing pact files, to prevent invalid / stale interactions being left over from previous test runs
1.  Each test is fully self-contained, with its **own mock server** on its **own port**
1.  You set the option `pactfileWriteMode` to `"merge"`, instructing Pact to merge any pact documents with the same consumer and provider pairing at the end of all test runs.

When all of your tests have completed, the result is the union of the all of the interactions from each test case in the generated pact file.

See the following examples for working parallel tests:

- [Pact with AVA (Node env)](https://github.com/pact-foundation/pact-js/tree/master/examples/ava)
- [Pact with Mocha](https://github.com/pact-foundation/pact-js/tree/master/examples/mocha)

### Splitting tests across multiple files

Pact tests tend to be quite long, due to the need to be specific about request/response payloads. Often times it is nicer to be able to split your tests across multiple files for manageability.

You have a number of options to achieve this feat:

1.  Consider implementing the [Parallel tests](#parallel-tests) guidelines.

1.  Create a Pact test helper to orchestrate the setup and teardown of the mock service for multiple tests.

    In larger test bases, this can significantly reduce test suite time and the amount of code you have to manage.

    See this [example](https://github.com/tarciosaraiva/pact-melbjs/blob/master/helper.js) and this [issue](https://github.com/pact-foundation/pact-js/issues/11) for more.

1.  Set `pactfileWriteMode` to `merge` in the `Pact()` constructor

    This will allow you to have multiple independent tests for a given Consumer-Provider pair, without it clobbering previous interactions, thereby allowing you to incrementally build up or modify your pact files.

    This feature addresses the use case of "my pact suite takes bloody ages to run, so I just want to replace the interactions that have been run in this test execution" and requires careful management

    _NOTE_: If using this approach, you _must_ be careful to clear out existing pact files (e.g. `rm ./pacts/*.json`) before you run tests to ensure you don't have left over requests that are no longer relevant.

    See this [PR](https://github.com/pact-foundation/pact-js/pull/48) for background.

### Test fails when it should pass

TL;DR - you almost certainly have not properly handled (returned) a Promise.

We see this sort of thing all of the time:

```js
it("returns a successful thing", () => {
  executeApiCallThatIsAPromise()
    .then((response) => {
      expect(response.data).to.eq({...})
    })
    .then(() => {
      provider.verify()
    })
  })
```

There are several problems with this:

1. in the "returns a successful thing", the call to `executeApiCallThatIsAPromise()` is a function that returns a Promise, but is not returned by the function (`it` block) - this leaves a dangling, unhandled Promise. In your case it fails, but by the time it does the `it` block has already completed without problems - and returns a green result ✅.
1. In the `then` block, the call to `provider.verify()` is also not returned, and will suffer the same fate as (1)

_Side note_: Jasmine and other test frameworks may detect an unhandled promise rejection and report on it.

The correct code for the above is:

```js
it("returns a successful thing", () => {
  return executeApiCallThatIsAPromise() // <- explicit return here, you could also use the "async/await" syntax here
    .then((response) => {
      expect(response.data).to.eq({...})
    })
    .then(() => provider.verify()) // provider.verify() also returned
  })
```

### Test intermittent failures

See above - you probably have not returned a Promise when you should have.

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

### Usage with Jest

Jest uses JSDOM under the hood which may cause issues with libraries making HTTP request.

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

Jest also runs tests in parallel by default, which can be problematic with Pact which is stateful. See [parallel tests](#parallel-tests) to see how to make it run in parallel, or run Jest with the `--runInBand` [option](https://facebook.github.io/jest/docs/en/cli.html#runinband) to run them sequentially.

See [this issue](https://github.com/pact-foundation/pact-js/issues/10) for background,
and the Jest [example](https://github.com/pact-foundation/pact-js/blob/master/examples/jest/package.json#L10-L12) for a working example.

### Usage with Angular

You way want to consider using this starter schematic: https://github.com/niklas-wortmann/ngx-pact

Angular's HttpClient filters out many headers from the response object, this may cause issues when validating a response in tests.

You'll need to add the additional header `Access-Control-Expose-Headers`, this will allow specified headers to be passed to the response object. This can be done by declaring the header in the `willRespondWith` section of your interaction:

```js
"willRespondWith": {
  "headers": {
    "Access-Control-Expose-Headers": like("My-Header"),
    "My-Header": "..."
  },
  ...
}
```

See [this issue](https://github.com/angular/angular/issues/13554) for background.

### Debugging

If your standard tricks don't get you anywhere, setting the logLevel to `debug` and increasing the timeout doesn't help and you don't know where else to look, it could be that the binaries we use to do much of the Pact magic aren't starting as expected.

Try starting the mock service manually and seeing if it comes up. When submitting a bug report, it would be worth running these commands before hand as it will greatly help us:

```
./node_modules/.bin/pact-mock-service
```

...and also the verifier (it will whinge about missing params, but that means it works):

```
./node_modules/.bin/pact-provider-verifier
```

## Contributing

1.  Fork it
2.  Create your feature branch from the relevant tree (e.g. [v5] or [v6]) (`git checkout -b my-new-feature`)
3.  Commit your changes (`git commit -am 'Add some feature'`)
4.  Push to the branch (`git push origin my-new-feature`)
5.  Create new Pull Request

## Contact

Join us on [Slack](https://slack.pact.io)

<a href="https://slack.pact.io"><img src="https://slack.pact.io/badge.svg"></img></a>

or chat to us at

- Twitter: [@pact_up](https://twitter.com/pact_up)
- Stack Overflow: https://stackoverflow.com/questions/tagged/pact

[getting started with pact]: https://docs.pact.io/getting_started
[spec]: https://github.com/pact-foundation/pact-specification
[changelog]: https://github.com/pact-foundation/pact-js/blob/master/CHANGELOG.md
[pactflow]: https://pactflow.io
