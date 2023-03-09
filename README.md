<span align="center">

![logo](https://user-images.githubusercontent.com/53900/121775784-0191d200-cbcd-11eb-83dd-adc001b94519.png)

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

#### Fast, easy and reliable testing for your APIs and microservices.

</span>

<br />
<p align="center">
  <a href="https://docs.pact.io"><img src="https://user-images.githubusercontent.com/53900/180370118-f11c61f3-4ae0-496f-98fa-052fdfad409e.gif" alt="Pact JS Demo"/></a>
</p>
<br />

<table>
<tr>
<td>

**Pact** is the de-facto API contract testing tool. Replace expensive and brittle end-to-end integration tests with fast, reliable and easy to debug unit tests.

- ⚡ Lightning fast
- 🎈 Effortless full-stack integration testing - from the front-end to the back-end
- 🔌 Supports HTTP/REST and event-driven systems
- 🛠️ Configurable mock server
- 😌 Powerful matching rules prevents brittle tests
- 🤝 Integrates with Pact Broker / PactFlow for powerful CI/CD workflows
- 🔡 Supports 12+ languages

**Why use Pact?**

Contract testing with Pact lets you:

- ⚡ Test locally
- 🚀 Deploy faster
- ⬇️ Reduce the lead time for change
- 💰 Reduce the cost of API integration testing
- 💥 Prevent breaking changes
- 🔎 Understand your system usage
- 📃 Document your APIs for free
- 🗄 Remove the need for complex data fixtures
- 🤷‍♂️ Reduce the reliance on complex test environments

Watch our [series](https://www.youtube.com/playlist?list=PLwy9Bnco-IpfZ72VQ7hce8GicVZs7nm0i) on the problems with end-to-end integrated tests, and how contract testing can help.

</td>
</tr>
</table>

![----------](https://user-images.githubusercontent.com/53900/182992715-aa63e421-170b-41cf-8f95-82fe4b0846c2.png)

## Documentation

This readme offers a basic introduction to the library. The full documentation for Pact JS and the rest of the framework is available at https://docs.pact.io/.

- [Installation](#installation)
- [Consumer Testing](/docs/consumer.md)
  - [Matching](/docs/matching.md)
- [Provider Testing](/docs/provider.md)
- [Event Driven Systems](/docs/messages.md)
- [GraphQL](/docs/graphql.md)
- [XML](/docs/xml.md)
- [Examples](https://github.com/pact-foundation/pact-js/tree/master/examples/)
- [Migration guide](/MIGRATION.md)
- [Troubleshooting](/docs/troubleshooting.md)

### Tutorial (60 minutes)

Learn the key Pact JS features in 60 minutes: https://github.com/pact-foundation/pact-workshop-js

## Need Help

- [Join](http://slack.pact.io) our community [slack workspace](http://pact-foundation.slack.com/).
- Stack Overflow: https://stackoverflow.com/questions/tagged/pact
- Say 👋 on Twitter: [@pact_up]

## Installation

```shell
npm i -S @pact-foundation/pact@latest

# 🚀 now write some tests!
```

Looking for the previous [stable 9.x.x release](https://github.com/pact-foundation/pact-js/tree/9.x.x)? 

### Requirements

1. Make sure the `ignore-scripts` option is disabled, pact uses npm scripts to compile native dependencies and won't function without it.
2. Pact uses native extensions and installs them via the [`node-gyp`](https://github.com/nodejs/node-gyp) package. This requires a [build chain](https://github.com/nodejs/node-gyp#installation) for a successful installation. See also issue [#899](https://github.com/pact-foundation/pact-js/issues/899). 

### Do Not Track

In order to get better statistics as to who is using Pact, we have an anonymous tracking event that triggers when Pact installs for the first time. The only things we [track](https://docs.pact.io/metrics) are your type of OS, and the version information for the package being installed. No PII data is sent as part of this request. You can disable tracking by setting the environment variable `PACT_DO_NOT_TRACK=1`:

![----------](https://user-images.githubusercontent.com/53900/182992715-aa63e421-170b-41cf-8f95-82fe4b0846c2.png)

## Usage

### Consumer package

The main consumer interface are the `PactV3` class and `MatchersV3` exports of the `@pact-foundation/pact` package.

#### Writing a Consumer test

Pact is a consumer-driven contract testing tool, which is a fancy way of saying that the API `Consumer` writes a test to set out its assumptions and needs of its API `Provider`(s). By unit testing our API client with Pact, it will produce a `contract` that we can share to our `Provider` to confirm these assumptions and prevent breaking changes.

In this example, we are going to be testing our User API client, responsible for communicating with the `UserAPI` over HTTP. It currently has a single method `GetUser(id)` that will return a `*User`.

Pact tests have a few key properties. We'll demonstrate a common example using the 3A `Arrange/Act/Assert` pattern.

```js
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

// Create a 'pact' between the two applications in the integration we are testing
const provider = new PactV3({
  dir: path.resolve(process.cwd(), 'pacts'),
  consumer: 'MyConsumer',
  provider: 'MyProvider',
});

// API Client that will fetch dogs from the Dog API
// This is the target of our Pact test
public getMeDogs = (from: string): AxiosPromise => {
  return axios.request({
    baseURL: this.url,
    params: { from },
    headers: { Accept: 'application/json' },
    method: 'GET',
    url: '/dogs',
  });
};

const dogExample = { dog: 1 };
const EXPECTED_BODY = MatchersV3.eachLike(dogExample);

describe('GET /dogs', () => {
  it('returns an HTTP 200 and a list of docs', () => {
    // Arrange: Setup our expected interactions
    //
    // We use Pact to mock out the backend API
    provider
      .given('I have a list of dogs')
      .uponReceiving('a request for all dogs with the builder pattern')
      .withRequest({
        method: 'GET',
        path: '/dogs',
        query: { from: 'today' },
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: EXPECTED_BODY,
      });

    return provider.executeTest((mockserver) => {
      // Act: test our API client behaves correctly
      //
      // Note we configure the DogService API client dynamically to 
      // point to the mock service Pact created for us, instead of 
      // the real one
      dogService = new DogService(mockserver.url);
      const response = await dogService.getMeDogs('today')

      // Assert: check the result
      expect(response.data[0]).to.deep.eq(dogExample);
    });
  });
});
```

You can see (and run) the full version of this in `./examples/v3/typescript`, as well as other examples in the parent folder.

To run the examples

1. Clone the repo `git@github.com:pact-foundation/pact-js.git`

Run a single example

1. Change into the required example folder `cd examples/e2e/v3/typescript`
2. Install all the examples dependencies `npm install`
3. Run all the example - `npm run test`

Run all examples

1. Change into the examples folder `cd examples`
2. Install all the examples dependencies `./installAll.sh`
3. Run all the examples `./runAll.sh`

![----------](https://user-images.githubusercontent.com/53900/182992715-aa63e421-170b-41cf-8f95-82fe4b0846c2.png)

### Provider package

The main provider interface is the `Verifier` class of the `@pact-foundation/pact` package.

#### Verifying a Provider

A provider test takes one or more pact files (contracts) as input, and Pact verifies that your provider adheres to the contract. In the simplest case, you can verify a provider as per below using a local pact file, although in practice you would usually use a Pact Broker to manage your contracts and CI/CD workflow.

```js
const { Verifier } = require('@pact-foundation/pact');

// (1) Start provider locally. Be sure to stub out any external dependencies
server.listen(8081, () => {
  importData();
  console.log('Animal Profile Service listening on http://localhost:8081');
});

// (2) Verify that the provider meets all consumer expectations
describe('Pact Verification', () => {
  it('validates the expectations of Matching Service', () => {
    let token = 'INVALID TOKEN';

    return new Verifier({
      providerBaseUrl: 'http://localhost:8081', // <- location of your running provider
      pactUrls: [ path.resolve(process.cwd(), "./pacts/SomeConsumer-SomeProvider.json") ],
    })
      .verifyProvider()
      .then(() => {
        console.log('Pact Verification Complete!');
      });
  });
});

```

It's best to run Pact verification tests as part of your unit testing suite, so you can readily access stubbing, IaC and other helpful tools.

![----------](https://user-images.githubusercontent.com/53900/182992715-aa63e421-170b-41cf-8f95-82fe4b0846c2.png)

## Compatibility

<details><summary>Specification Compatibility</summary>

| Version | Stable | [Spec] Compatibility | Install            |
| ------- | ------ | -------------------- | ------------------ |
| 11.x.x  | Yes    | 2, 3, 4              | See [installation] |
| 10.x.x  | Yes    | 2, 3, 4              | See [installation] |
| 9.x.x   | Yes    | 2, 3\*               | [9xx]              |

_\*_ v3 support is limited to the subset of functionality required to enable language inter-operable [Message support].

</details>

## Roadmap

The [roadmap](https://docs.pact.io/roadmap/) for Pact and Pact JS is outlined on our main website.
## Contributing

See [CONTRIBUTING](CONTRIBUTING.md).

<a href="https://github.com/pact-foundation/pact-js/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pact-foundation/pact-js" />
</a>
<br />

[spec]: https://github.com/pact-foundation/pact-specification
[10xx]: https://github.com/pact-foundation/pact-js/tree/10.x.x
[9xx]: https://github.com/pact-foundation/pact-js/tree/9.x.x
[pact website]: http://docs.pact.io/
[@pact_up]: https://twitter.com/pact_up
[pact specification v2]: https://github.com/pact-foundation/pact-specification/tree/version-2
[pact specification v3]: https://github.com/pact-foundation/pact-specification/tree/version-3
[library]: https://github.com/pact-foundation/pact-reference/releases
[installation]: #installation
[message support]: https://github.com/pact-foundation/pact-specification/tree/version-3#introduces-messages-for-services-that-communicate-via-event-streams-and-message-queues
[changelog]: https://github.com/pact-foundation/pact-js/blob/master/CHANGELOG.md
[pact broker]: https://github.com/pact-foundation/pact_broker
[pactflow]: https://pactflow.io
