# Pact-js migration guide

This guide is for migrating to a new version of pact-js.

# beta.44 to beta.45

## Verifier Options

There are several changes to the `VerifierOptions`. To migrate:

- Replace `verbose` with `logLevel: "DEBUG"` (logLevels of `DEBUG` and below now imply `verbose` where appropriate)
- Replace `consumerVersionTag` with the `consumerVersionTags` array
- Replace `providerVersionTag` with the `providerVersionTags` array
- Replace `tags` with `consumerVersionTags` or `providerVersionTags` as appropriate.

Some options have been removed entirely:

- `customProviderHeaders` has been removed. If you need this functionality, set an
  appropriate request filter with the `requestFilters` option instead.
- All logging and reporting is now on standard out (this was the default before).
  This means `logDir` / `format` / `out` have all been removed. If your ecosystem needs
  the ability to customise logging and reporting, please let us know by opening an issue.
- The undocumented option `monkeypatch` has been removed. The use cases for this
  feature are mostly covered by other options.
