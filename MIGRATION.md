# Pact-js migration guide

This guide is for migrating to a new version of pact-js.

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
