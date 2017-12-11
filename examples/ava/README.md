# Ava example

The ava example is a really simple demonstration of the use of Pact in parallel ava tests.

Note that the two Dog API endpoints have separate tests, but are for the same consumer/provider pair.

Each test is fully self-contained, yet the result of running both creates a union of the two test cases in the generated pact file.

This is achieved by setting `pactfileWriteMode: 'merge'`, which instructs Pact to merge any documents with the same consumer and provider pairing at the end of all test runs. Note that you need to create a separate mock server on a different port for each test.
