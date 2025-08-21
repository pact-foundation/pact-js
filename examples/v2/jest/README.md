# Jest Example

1. In the pact-js project root, change to the `examples/jest` directory
1. Run: `npm i`
1. Run the tests: `npm t`

## Comments about Jest

To avoid race conditions if you have multiple pact specs, we recommend running Jest '[in band](https://facebook.github.io/jest/docs/en/cli.html#runinband)'. If you are running a large unit test suite you may want to run that separately as a result to take advantage of the concurrency of jest (although this is not always faster). To achieve this you can get your pact tests to have a suffix of '.pact.js' and add the following Jest argument to your pact task in npm:

```
--testRegex \"/*(.test.pact.js)\""
```

This example uses [`jest-pact`](https://github.com/pact-foundation/jest-pact)
