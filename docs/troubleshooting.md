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

Alpine is not currently supported, you should run your Pact tests in a full linux distribution such as Ubuntu or Debian.
As a workaround to prevent Docker build failure you may install the following packages:
```sh
RUN apk add --no-cache libc6-compat python3 make g++
```

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

## Installation failing (Missing Python, C++ or build tools)

Pact has the following requirements for a successful install:

1. Make sure the `ignore-scripts` option is disabled, pact uses npm scripts to compile native dependencies and won't function without it.
2. Pact uses native extensions and installs them via the [`node-gyp`](https://github.com/nodejs/node-gyp) package. This requires a [build chain](https://github.com/nodejs/node-gyp#installation) for a successful installation. See also issue [#899](https://github.com/pact-foundation/pact-js/issues/899).
3. Pact also currently requires `glibc >= 2.24`. Most modern OS distributions will ship with a compatible version. This means _we don't support Alpine_ (it uses musl)

The issue may present in several ways, here are common ones on unix-like and Windows operating systems:
### Unix/MacOSX

```
> @pact-foundation/pact-core@13.9.1 install /workdir/node_modules/@pact-foundation/pact-core
> node-gyp rebuild
 
gyp ERR! configure error
gyp ERR! stack Error: Command failed: /usr/bin/python -c import sys; print "%s.%s.%s" % sys.version_info[:3];
gyp ERR! stack   File "<string>", line 1
gyp ERR! stack     import sys; print "%s.%s.%s" % sys.version_info[:3];
gyp ERR! stack                                ^
gyp ERR! stack SyntaxError: invalid syntax
gyp ERR! stack
gyp ERR! stack     at ChildProcess.exithandler (child_process.js:294:12)
gyp ERR! stack     at ChildProcess.emit (events.js:198:13)
gyp ERR! stack     at maybeClose (internal/child_process.js:982:16)
gyp ERR! stack     at Process.ChildProcess._handle.onexit (internal/child_process.js:259:5)
gyp ERR! System Linux 4.14.248-189.473.amzn2.x86_64
gyp ERR! command "/usr/local/bin/node" "/usr/local/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js" "rebuild"
gyp ERR! cwd /workdir/node_modules/@pact-foundation/pact-core
gyp ERR! node -v v10.16.0
gyp ERR! node-gyp -v v3.8.0
gyp ERR! not ok
```

### Windows

```
npm i @pact-foundation/pact @pact-foundation/pact-node
npm WARN deprecated libnpmconfig@1.2.1: This module is not used anymore. npm config is parsed by npm itself and by @npmcli/config
npm WARN deprecated fastify-warning@0.2.0: This module renamed to process-warning
npm ERR! code 1
npm ERR! path C:\Users\gwenne\Desktop\Workspace\testing-tools\pact-io-test\node_modules\@pact-foundation\pact-core
npm ERR! command failed
npm ERR! command C:\WINDOWS\system32\cmd.exe /d /s /c node-gyp rebuild
npm ERR! gyp info it worked if it ends with ok
npm ERR! gyp info using node-gyp@9.1.0
npm ERR! gyp info using node@18.8.0 | win32 | x64
npm ERR! gyp info find Python using Python version 3.10.8 found at "C:\Users\gwenne\AppData\Local\Programs\Python\Python310\python.exe"
npm ERR! gyp http GET https://nodejs.org/download/release/v18.8.0/node-v18.8.0-headers.tar.gz
npm ERR! gyp http 200 https://nodejs.org/download/release/v18.8.0/node-v18.8.0-headers.tar.gz
npm ERR! gyp http GET https://nodejs.org/download/release/v18.8.0/SHASUMS256.txt
npm ERR! gyp http GET https://nodejs.org/download/release/v18.8.0/win-x64/node.lib
npm ERR! gyp http GET https://nodejs.org/download/release/v18.8.0/win-arm64/node.lib
npm ERR! gyp http GET https://nodejs.org/download/release/v18.8.0/win-x86/node.lib
npm ERR! gyp http 200 https://nodejs.org/download/release/v18.8.0/SHASUMS256.txt
npm ERR! gyp http 404 https://nodejs.org/download/release/v18.8.0/win-arm64/node.lib
npm ERR! gyp http 200 https://nodejs.org/download/release/v18.8.0/win-x86/node.lib
npm ERR! gyp http 200 https://nodejs.org/download/release/v18.8.0/win-x64/node.lib
npm ERR! gyp ERR! find VS
npm ERR! gyp ERR! find VS msvs_version not set from command line or npm config
npm ERR! gyp ERR! find VS VCINSTALLDIR not set, not running in VS Command Prompt
npm ERR! gyp ERR! find VS could not use PowerShell to find Visual Studio 2017 or newer, try re-running with '--loglevel silly' for more details
npm ERR! gyp ERR! find VS looking for Visual Studio 2015
npm ERR! gyp ERR! find VS - not found
npm ERR! gyp ERR! find VS not looking for VS2013 as it is only supported up to Node.js 8
npm ERR! gyp ERR! find VS
npm ERR! gyp ERR! find VS **************************************************************
npm ERR! gyp ERR! find VS You need to install the latest version of Visual Studio
npm ERR! gyp ERR! find VS including the "Desktop development with C++" workload.
npm ERR! gyp ERR! find VS For more information consult the documentation at:
npm ERR! gyp ERR! find VS https://github.com/nodejs/node-gyp#on-windows
npm ERR! gyp ERR! find VS **************************************************************
npm ERR! gyp ERR! find VS
npm ERR! gyp ERR! configure error
npm ERR! gyp ERR! stack Error: Could not find any Visual Studio installation to use
...
```
