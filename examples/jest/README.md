# Jest Example

1. In the pact-js project root, run: `npm i`
1. Run: `npm run compile`
1. Change to the `examples/jest` directory.
1. Run: `npm i`
1. Run the tests: `npm t`

## Comments about Jest
You will need to run jest '[in band](https://facebook.github.io/jest/docs/en/cli.html#runinband)' as it will cause state issues otherwise. If you are running a large unit test suite you'll probably want to run that separately as a result to take advantage of the concurrency of jest (it is quite a slow down). To achieve this you can get your pact tests to have a suffix of '.pact.js' and add the following to your pact task in npm:
```
--testRegex \"/*(.test.pact.js)\""
```

Also the examples have set up a global 'provider' variable using the 'pactSetup.js' file. Then the pactTestWrapper.js ensures each test file will have the provider setup for them. The beforeAll and afterAll in jest is not before all tests but before each file. I had to put the
```
pactfileWriteMode: 'update'
```
in the provider to get pacts appended to.

Also note the publish is a separate task. As there is no real afterAll it is difficult to know when to publish in normal running so I had to extract it.
