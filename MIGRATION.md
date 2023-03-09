# Pact-js migration guide

# 10.x.x -> 11.x.x

There is just one single [breaking change](https://github.com/pact-foundation/pact-js/blob/master/CHANGELOG.md#-breaking-changes) in this release. A conflicting type `StateHandlers` has been renamed to  `MessageStateHandlers` for use in message pact tests.

# 9.x.x -> 10.x.x

See the [9.x.x -> 10.x.x](/docs/migrations/9-10.md) migration guide.

# beta.62

Removed the default export for v3 in the root package in preparation for a release.

# beta.61

* new `addInteraction` method on PactV3 to support previous JSON-style interactions
* remove `VerifierV3` as many beta versions have passed with this deprecation notice and won't be in final release
* remove `json()` method from consumer message pact
* add new `WithBinaryContent` method for consumer messages
* add binary content support to messages via `WithBinaryContent`
* add text content support to messages via `WithTextContent`
* Remove all Ruby dependencies in DSLs
* `pactfileWriteMode` still supports the same options, however the behaviour of `overwrite` is such now that it will overwrite the pact file _per test_, not pact run of Pact. This is because there is no longer a single long running mock server as per previous versions. Set to `merge` or leave blank for a sensible default. 
* As per the change to `pactfileWriteMode` this also means pact files should be cleared out prior to each test, to avoid extraneous interactions in a pact file.
* Array matcher currently doesn't work on query strings (see https://github.com/pact-foundation/pact-reference/issues/205). However, an array with matchers is supported (see jest spec)
* the `mockService` property on the `Pact` class is no longer an actual `MockService`, but supports the `baseUrl` property.
* Manually controlling the state of the mock server - such as removing interactions - has been removed.

# beta.56

Migrates to a new handle based verifier. This adds several layers of improvement, including better error handling/response output (which will be added in later versions).

* Drop support for migrating `disableSSLVerification` (correct field is `**disableSslVerification**`)
* Handle based verifier doesn't support environment variables (i.e. `PACT_BROKER_*`)

This guide is for migrating to a new version of pact-js.
# beta.52

The following matchers now must have an explicit example provided:

* `datetime`
* `timestamp`
* `time`

# beta.47

Change uses of `RFC3339_TIMESTAMP_FORMAT` or `Matchers.rfc1123Timestamp()` to
`RFC1123_TIMESTAMP_FORMAT` and `rfc1123Timestamp` respectively (this matcher
has always been RFC1123, not RFC3339).

# beta.44 to beta.45

You no longer need to use `VerifierV3`. You may now do:

```
import { Verifier } from '@pact-foundation/pact'
```

If migrating from VerifierV3, note that `disableSSLVerification` has been
renamed `disableSslVerification` for consistency with other options.
The `VerifierV3` still exists with the old options, it now delegates to the main verifier.

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
