# Troubleshooting

If you are having issues, a good place to start is setting `logLevel: 'debug'` when configuring the `new Pact({...})` object. This will give you detailed in/out requests as far as Pact sees them during verification.

## Corporate Proxies / Firewalls

If you're on a corporate machine, it's common for all network calls to route through a proxy - even requests that go to your own machine!

The symptom presents as follows:

1. The mock server starts up correctly, as shown by a debug level log message such as this:

   ```
   [2021-11-22 11:16:01.214 +0000] DEBUG (3863 on Matts-iMac): pact-core@11.0.1: INFO  WEBrick::HTTPServer#start: pid=3864 port=50337
   ```

2. You receive a conflicting message such as "The pact mock service doesn't appear to be running" and the tests never run or any before all blocks fail to complete.

The problem is that the Pact framework attempts to ensure the mock service can be communicated with before the tests run. It does so via an HTTP call, which will be sent via any intermediate proxies if configured. The proxy is unlikely to know how send the request back to your machine, which results in a timeout or error.

This may be resolved by ensuring the `http_proxy`, `https_proxy` and `no_proxy` directives are correctly set (usually, by excluding the address of the mock server such as `localhost` or `127.0.0.1`).

## Alpine + Docker

Alpine is not currently supported, you should run your Pact tests in a full linux distribution such as Ubunt or Debian.

## Test fails when it should pass

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

## Test intermittent failures

See above - you probably have not returned a Promise when you should have.

## Re-run specific verification failures

If you prefix your test command (e.g. `npm t`) with the following environment variables, you can selectively run a specific interaction during provider verification.

| variable name          | description                                                                                            | comments    |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ----------- |
| PACT_DESCRIPTION       | select all tests that contain this string in its `description`(from the test output, or the pact file) |             |
| PACT_PROVIDER_STATE    | select all tests that contain this string in on of its `providerState`                                 |             |
| PACT_PROVIDER_NO_STATE | set to `TRUE` to select all tests what don't have any `providerState`                                  | only for V3 |

For the e2e example, let's assume we have the following failure:

```sh
3 interactions, 2 failures

Failed interactions:

* A request for all animals given Has some animals

* A request for an animal with id 1 given Has an animal with ID 1
```

If we wanted to target the second failure, we can extract the description and state as the bits before and after the word "given":

```sh
PACT_DESCRIPTION="A request for an animal with ID 1" PACT_PROVIDER_STATE="Has an animal with ID 1" npm t
```

## Usage with Jest

TL;DR - consider the use of `jest-pact` package.

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

## Usage with Mocha

Consider the use of the `mocha-pact` [package](https://www.npmjs.com/package/mocha-pact)

## Usage with Angular

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

## Using Pact in non-Node environments such as Karma

Pact requires a Node runtime to be able to start and stop Mock servers, write logs and other things.

However, when used within browser or non-Node based environments - such as with Karma or ng-test - this is not possible.

You will need a Node based test framework such as Jest or Mocha.

## Unable to run tests in Alpine linux

Alpine linux is currently [not supported](https://github.com/pact-foundation/pact-net/issues/387).

## How do I test negative scenarios, such as an HTTP `400`, `401` or `500`?

Testing HTTP errors is straightforward with Pact, however most api clients (such as Axios) will throw if they receive a response code `>= 400`. It might not be obvious that you need to modify your test slightly to deal with this.

Take this example where we would like to test a `400`:

```js
it('should return an error when an invalid ID is requested', async () => {
    await provider.addInteraction({
        uponReceiving: 'an invalid request',
        withRequest: {
            method: 'GET',
            path: '/bad/m1xf%d5/path/'
        },
        willRespondWith: {
            status: 400,
            body: {
                error: 'BadRequest',
                message: 'Invalid ID format',
                statusCode: 400
            }
        }
    });

    const api = new ApiClient(provider.mockService.baseUrl);
    const response = await api().doSomething('m1xf%d5'); // <-- throws
    expect(response).toThrow('400: Bad Request');        // <-- Too late, already thrown!
});
```

This test will fail, because the use of `await` will throw if the promise is rejected.

To correct this test, you should pass the Promise to `expect` directly, and `return` or `await` the result.

For example, with Jest you could do this:

```js
await expect(api.doSomething('m1xf%d5')).rejects.toMatch('400: Bad Request');
```

If you are using Mocha with [`chai-as-promised`](https://www.chaijs.com/plugins/chai-as-promised/), you can do this:

```js
await expect(api.doSomething('m1xf%d5')).to.eventually.be.rejectedWith('400: Bad Request')
```

The Jest [docs](https://jestjs.io/docs/asynchronous) explains why, but this principle is the same regardless of your test framework (e.g. Mocha, Jest or Ava).