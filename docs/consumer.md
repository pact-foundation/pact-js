# Consumer Tests

## Contract Testing Process (HTTP)

Pact is a consumer-driven contract testing tool, which is a fancy way of saying that the API `Consumer` writes a test to set out its assumptions and needs of its API `Provider`(s). By unit testing our API client with Pact, it will produce a `contract` that we can share to our `Provider` to confirm these assumptions and prevent breaking changes.

The process looks like this:

![diagram](./diagrams/summary.png)

1. The consumer writes a unit test of its behaviour using a Mock provided by Pact
1. Pact writes the interactions into a contract file (as a JSON document)
1. The consumer publishes the contract to a broker (or shares the file in some other way)
1. Pact retrieves the contracts and replays the requests against a locally running provider
1. The provider should stub out its dependencies during a Pact test, to ensure tests are fast and more deterministic.

In this document, we will cover steps 1-3.

## Consumer package

To use the library on your tests, add the pact dependency:

```javascript
const { PactV3 } = require("@pact-foundation/pact")
```

The `PactV3` class provides the following high-level APIs, they are listed in the order in which they typically get called in the lifecycle of testing a consumer:

### API

<details><summary>Consumer API</summary>

| API | Options | Description |
|-----|---------|-------------|
| `new PactV3(options)` | See constructor options below | Creates a Mock Server test double of your Provider API. The class is **not** thread safe, but you can run tests in parallel by creating as many instances as you need. |
| `addInteraction(...)`  | `V3Interaction` | Register an expectation on the Mock Server passing in a full `V3Interaction` object, which must be called by your test case(s). You can add multiple interactions per server, however it is recommended to only have one. These will be validated and written to a pact if successful. Alternatively, you may setup the interactions calling the builder methods below|
| `given(...)` | `ProviderStateV3` | The provider state for the interaction |
| `uponReceiving(...)` | string | The scenario name. The combination of `given` and `uponReceiving` must be unique in the pact file |
| `withRequest(...)` | `V3Request` | The HTTP request info |
| `withRequestBinaryFile(...)` | - | Similar to `withRequest` however you can also specify a path to a file to upload and its content type |
| `withRequestMultipartFileUpload(...)` | - | Similar to `withRequest` however you can also specify a path to a file to upload, its content type and the mime part name|
| `willRespondWith(...)` | `V3Response` | The HTTP response details |
| `withResponseBinaryFile(...)` | - | Similar to `withResponse` however you can also specify a path to a file to receive and its content type |
| `withResponseMultipartFileUpload(...)` | - | Similar to `withResponse` however you can also specify a path to a file to receive, its content type and the mime part name | |
| `executeTest(...)` | - | Executes a user defined function, passing in details of the dynamic mock service for use in the test. If successful, the pact file is updated	 |
</details>

<details><summary>Constructor</summary>

| Parameter           | Required? | Type    | Description                                                                                              |
| ------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `consumer`          | yes       | string  | The name of the consumer                                                                                 |
| `provider`          | yes       | string  | The name of the provider                                                                                 |
| `port`              | no        | number  | The port to run the mock service on, defaults to a random machine assigned available port                                                    |
| `host`              | no        | string  | The host to run the mock service, defaults to 127.0.0.1                                                  |
| `tls`               | no        | boolean | flag to identify which protocol to be used (default false, HTTP)                                       |
| `dir`               | no        | string  | Directory to output pact files                                                                           |
| `log`               | no        | string  | File to log to                                                                                           |
| `logLevel`          | no        | string  | Log level: one of 'trace', 'debug', 'info', 'error', 'fatal' or 'warn'                                   |
| `spec`              | no        | number  | Pact specification version (defaults to 2)                                                               |
| `cors`              | no        | boolean | Allow CORS OPTION requests to be accepted, defaults to false                                             |
| `timeout`           | no        | number  | The time to wait for the mock server tq5o start up in milliseconds. Defaults to 30 seconds (30000)         |

</details>

### Example

The first step is to create a test for your API Consumer. The example below uses [Mocha](https://mochajs.org), and demonstrates the basic approach:

1.  Create the Pact object
1.  Start the Mock Provider that will stand in for your actual Provider
1.  Add the interactions you expect your consumer code to make when executing the tests
1.  Write your tests - the important thing here is that you test the outbound _collaborating_ function which calls the Provider, and not just issue raw http requests to the Provider. This ensures you are testing your actual running code, just like you would in any other unit test, and that the tests will always remain up to date with what your consumer is doing.
1.  Validate the expected interactions were made between your consumer and the Mock Service
1.  Generate the pact(s)

Check out the [examples](https://github.com/pact-foundation/pact-js/tree/master/examples/) for more of these.

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

Read on about [matching](/docs/matching.md)