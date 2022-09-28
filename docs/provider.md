# Provider Verification

Pact Go supports both HTTP and non-HTTP verification (using plugins).

## Contract Testing Process (HTTP)

Pact is a consumer-driven contract testing tool, which is a fancy way of saying that the API `Consumer` writes a test to set out its assumptions and needs of its API `Provider`(s). By unit testing our API client with Pact, it will produce a `contract` that we can share to our `Provider` to confirm these assumptions and prevent breaking changes.

The process looks like this:

![diagram](./diagrams/summary.png)

1. The consumer writes a unit test of its behaviour using a Mock provided by Pact
1. Pact writes the interactions into a contract file (as a JSON document)
1. The consumer publishes the contract to a broker (or shares the file in some other way)
1. Pact retrieves the contracts and replays the requests against a locally running provider
1. The provider should stub out its dependencies during a Pact test, to ensure tests are fast and more deterministic.

In this document, we will cover steps 4-5.

## HTTP Provider package

The provider interface is in the package: `github.com/pact-foundation/pact-go/v2/provider`.

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
const opts = {
  ...
};

new Verifier(opts).verifyProvider().then(function () {
	// do something
});
```

#### Verification Options

<details><summary>Verification Options</summary>

| Parameter | Required? | Type | Description|
| --------- | --------- | ---- | ---------- |
| `providerBaseUrl`           | true      | string                         | Running API provider host endpoint.|
| `pactBrokerUrl`             | false     | string                         | Base URL of the Pact Broker from which to retrieve the pacts. Required if `pactUrls` not given.                                                                                                    |
| `provider`                  | false     | string                         | Name of the provider if fetching from a Broker                                                                                                                                                     |
| `consumerVersionSelectors`  | false     | ConsumerVersionSelector\|array | Using [Selectors](https://docs.pact.io/pact_broker/advanced_topics/consumer_version_selectors/) is a way we specify which pacticipants and versions we want to use when configuring verifications. |
| `consumerVersionTags`       | false     | string\|array                  | Retrieve the latest pacts with given tag(s)                                                                                                                                                        |
| `providerVersionTags`       | false     | string\|array                  | Tag(s) to apply to the provider application                                   | `providerVersionBranch`       | false     | string                 | Branch to apply to provider application version (recommended to set) |
| `includeWipPactsSince`      | false     | string                         | Includes pact marked as WIP since this date. String in the format %Y-%m-%d or %Y-%m-%dT%H:%M:%S.000%:z                                                                                             |
| `pactUrls`                  | false     | array                          | Array of local pact file paths or HTTP-based URLs. Required if _not_ using a Pact Broker.                                                                                                          |
| `providerStatesSetupUrl`    | false     | string                         | Deprecated (use URL to send PUT requests to setup a given provider state                                                                                                                           |
| `stateHandlers`             | false     | object                         | Map of "state" to a function that sets up a given provider state. See docs below for more information                                                                                              |
| `requestFilter`             | false     | function ([Express middleware](https://expressjs.com/en/guide/using-middleware.html))                       | Function that may be used to alter the incoming request or outgoing response from the verification process. See below for use.                                                                     |
| `beforeEach`                | false     | function                       | Function to execute prior to each interaction being validated                                                                                                                                      |
| `afterEach`                 | false     | function                       | Function to execute after each interaction has been validated                                                                                                                                      |
| `pactBrokerUsername`        | false     | string                         | Username for Pact Broker basic authentication                                                                                                                                                      |
| `pactBrokerPassword`        | false     | string                         | Password for Pact Broker basic authentication                                                                                                                                                      |
| `pactBrokerToken`           | false     | string                         | Bearer token for Pact Broker authentication                                                                                                                                                        |
| `publishVerificationResult` | false     | boolean                        | Publish verification result to Broker (_NOTE_: you should only enable this during CI builds)                                                                                                       |
| `providerVersion`           | false     | string                         | Provider version, required to publish verification result to Broker. Optional otherwise.                                                                                                           |
| `enablePending`             | false     | boolean                        | Enable the [pending pacts](https://docs.pact.io/pending) feature.                                                                                                                                  |
| `timeout`                   | false     | number                         | The duration in ms we should wait to confirm verification process was successful. Defaults to 30000.                                                                                               |
| `logLevel`                  | false     | string                         | not used, log level is set by [environment variable](#debugging-issues-with-pact-js-v3)                                                                                                            |

</details>

To dynamically retrieve pacts from a Pact Broker for a provider, provide the broker URL, the name of the provider, and the consumer version tags that you want to verify:

```js
const opts = {
  pactBroker: "http://my-broker",
  provider: "Animal Profile Service",
  consumerVersionTags: ["master", "test", "prod"],
}
```

To verify a pact at a specific URL (eg. when running a pact verification triggered by a 'contract content changed' webhook, or when verifying a pact from your local machine, or a network location that's not the Pact Broker, set just the `pactUrls`, eg:

```js
const opts = {
  pactUrls: [process.env.PACT_URL],
}
```

To publish the verification results back to the Pact Broker, you need to enable the 'publish' flag, set the provider version and optional provider version tags:

```js
const opts = {
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

For these cases, we the ability to modify a request/response and modify the payload. The flag to achieve this is `requestFilter`.

**Example API with Authorization**

For example, to have an `Authorization` bearer token header sent as part of the verification request, set the `verifyProvider` options as per below:

```js
let token
const opts = {
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

   "test:publish": "./node_modules/.bin/pact-broker publish <YOUR_PACT_FILES_OR_DIR> --consumer-app-version=\"$(npx absolute-version)\" --auto-detect-version-properties --broker-base-url=https://your-broker-url.example.com"
```

For a full list of the options, see the [CLI usage instructions](https://github.com/pact-foundation/pact-ruby-standalone/releases).
All CLI binaries are available in npm scripts when using pact-js.

If you want to pass your username and password to the broker without including
them in scripts, you can provide it via the environment variables
`PACT_BROKER_USERNAME` and `PACT_BROKER_PASSWORD`. If your broker supports an
access token instead of a password, use the environment variable
`PACT_BROKER_TOKEN`.

#### Publishing Verification Results to a Pact Broker

If you're using a Pact Broker (e.g. a hosted one at https://pactflow.io), you can
publish your verification results so that consumers can query if they are safe
to release.

It looks like this:

![screenshot of verification result](https://cloud.githubusercontent.com/assets/53900/25884085/2066d98e-3593-11e7-82af-3b41a20af8e5.png)

To publish the verification results back to the Pact Broker, you need to enable the 'publish' flag, set the provider version and optional provider version tags:

```js
const opts = {
  publishVerificationResult: true, //recommended to only publish from CI by setting the value to `process.env.CI === 'true'`
  providerVersion: "version", //recommended to be the git sha eg. process.env.MY_CI_COMMIT
  providerVersionBranch: "master", //recommended to be the git branch eg. process.env.MY_GIT_SHA
  providerVersionTags: ["tag"], //optional, recommended to be the git branch eg. process.env.MY_CI_BRANCH
}
```
