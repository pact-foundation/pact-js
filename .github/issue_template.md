## Software versions

* **OS**: e.g. Mac OSX 10.11.5
* **Consumer Pact library**: e.g. Pact JS v2.6.0
* **Provider Pact library**: e.g. pact-jvm-provider-maven_2.11 v 3.3.8
* **Node Version**: `node --version`

## Expected behaviour

TBC

## Actual behaviour

TBC

## Steps to reproduce

Provide a repository, gist or reproducible code snippet so that we can test the problem.

Consider forking the project and modifying the [E2E test](https://github.com/pact-foundation/pact-go/blob/master/dsl/pact_integration_test.go)

## Relevant log files

Please ensure you set logging to `DEBUG` and attach any relevant log files here (or link from a gist).

### Debugging

Can you run the following commands? If not, please provide any stack trace:

```
./node_modules/@pact-foundation/pact-standalone/platforms/<platform>/bin/pact-mock-service
./node_modules/@pact-foundation/pact-standalone/platforms/<platform>/bin/pact-provider-verifier
```

Replace `<platform>` with your relevant OS.
