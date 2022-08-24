## Example Consumer test using Pact V3 features

This is an example project with a test that uses V3 Pact features. It has an example test for both JSON and XML format.

## To run it

1. Install the project dependencies

```console
cd examples/v3/todo-consumer/
npm install
```

2. Run the test with Mocha

```console
npm test
```

## V3 features

This has 2 tests. The first uses generators and matchers for numbers and datetime values. The second test deals with XML responses.