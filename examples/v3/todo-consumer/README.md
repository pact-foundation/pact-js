## Example Consumer test using Pact V3 features

This is an example project with a test that uses V3 Pact features. It has an example test for both JSON
and XML format.

## To run it

Until the beta version of Pact-JS with V3 support is released, you need to do the following:

1. Install Rust

Use the Rustup tool from https://rustup.rs/ to do this.

2. Generate a Pact-JS package

In the root of the Pact-JS project, run the following (assuming you have already installed the Node modules):

```console
$ npm run dist
$ npm pack
```

This should create a Tarball which you can now install in this project.

```console
$ cd examples/v3/todo-consumer/
$ npm install ../../../pact-foundation-pact-10.0.0-beta.0.tgz
```

This will install Pact-JS and then use Rust to compile the native module.

3. Run the test with Mocha

```console
$ npm test
```

## V3 features

This has 2 tests. The first uses generators and matchers for numbers and datetime values. The second 
test deals with XML responses.

