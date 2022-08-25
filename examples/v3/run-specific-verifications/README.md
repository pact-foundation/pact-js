# run specific verifications example

Using some pre-created pact files we are demonstrating the possibility to rerun specific verifications by filtering using env. variables.

Main documentation: https://github.com/pact-foundation/pact-js/#re-run-specific-verification-failures

This folder contains 3 pact files, each file contains some interactions that should be run, and some that should be skipped. Every test that should be skipped sends a `GET` requests to the `/fail` endpoint and expects `"result": "OK"`. If those interactions are executed they will fail (because the endpoint `/fail` does not return the expected result) and with it the whole test-run. That way these tests are also used as automated tests for pact-js itself and check if the filtering works correctly. To achieve that the env variables are set inside of `test/provider.spec.js` using `process.env.`.

To play around with the filtering delete the `process.env. ...` lines in `test/provider.spec.js`, set the env. variables outside the test run e.g. `PACT_DESCRIPTION="a request to be skipped" npm run test:provider` and see what interactions are executed

Run tests with `npm run test:provider`
