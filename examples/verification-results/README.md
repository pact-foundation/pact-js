# Verification Results Example

This example verifies **two pacts against one provider** and looks at what
`verifyProvider()` actually hands back. It is the groundwork (Phase 0) for the
per-interaction reporting extension: one `describe` per pact, one `it` per
interaction in Jest or Vitest.

The provider and its three endpoints mirror the reference project
[frudisch/pact-beforeeach-desync-repro](https://github.com/frudisch/pact-beforeeach-desync-repro):
`GET /one`, `GET /two` and `GET /three`, each answering `{ ok: true }`.

## Scenario

| Pact                          | Interactions                                                               |
| ----------------------------- | -------------------------------------------------------------------------- |
| `DemoConsumer -> DemoProvider`  | `interaction 1 - GET /one`, `interaction 2 - GET /two`, `interaction 3 - GET /three` (with provider state `resource three is available`) |
| `OtherConsumer -> DemoProvider` | `a request for one`, `a request for two`                                   |

## Running the Example

```bash
npm install
npm test                       # consumer tests (write pacts/), then provider verification
npm run test:provider:failing  # verification against a deliberately broken provider
npm run capture:fixtures       # additionally records the raw verifier JSON into fixtures/
```

`provider.test.ts` uses `defineVerificationSuite()`: every pact becomes a
`describe`, every interaction an `it`, and the verification runs once for all
of them. Against the broken provider the report shows exactly which
interactions failed and why:

```
 ❯ provider.test.ts (5 tests | 3 failed)
   ✓ DemoProvider > DemoConsumer -> DemoProvider > interaction 1 - GET /one
   × DemoProvider > DemoConsumer -> DemoProvider > interaction 2 - GET /two
     → Verification of 'DemoConsumer -> DemoProvider: interaction 2 - GET /two' failed:
         - BodyMismatch at $: Actual map is missing the following keys: ok
         - StatusMismatch: expected 200 but was 500
   × DemoProvider > DemoConsumer -> DemoProvider > interaction 3 - GET /three
   ✓ DemoProvider > OtherConsumer -> DemoProvider > a request for one
   × DemoProvider > OtherConsumer -> DemoProvider > a request for two
```

`provider-baseline.test.ts` keeps the conventional single-test verification
with `verifyProvider()` for comparison.

`capture:fixtures` runs the verification twice: once against the healthy
provider and once against a deliberately broken one (`GET /two` answers 500,
`GET /three` answers `{ ok: "true" }`). The two JSON documents are stored as
`fixtures/verification-success.json` and `fixtures/verification-failure.json`
and copied to `src/dsl/verifier/__fixtures__/` in pact-js as test input for the
result parser.

## What `verifyProvider()` Returns Today

Since pact-core 19 the native verifier returns the JSON document produced by
the Rust core (`pactffi_verifier_json`). pact-js passes it through unchanged:

- on success `verifyProvider()` **resolves** with the JSON string,
- on failure it **rejects** with an `Error` whose `message` is the JSON string.

Top-level structure (see the fixtures for complete documents):

```jsonc
{
  "result": false,                 // overall pass/fail
  "notices": [],                   // Pact Broker notices
  "output": ["...", "..."],        // the human readable report, one line per entry, with ANSI colours
  "pendingErrors": [],             // failures of pending pacts/interactions
  "errors": [                      // one entry per failed interaction
    {
      "interaction": "Verifying a pact between DemoConsumer and DemoProvider Given resource three is available - interaction 3 - GET /three",
      "mismatch": {
        "type": "mismatches",      // or "error"
        "interactionId": "",       // only set for pacts loaded from a broker
        "mismatches": [
          { "type": "StatusMismatch", "expected": 200, "actual": 500, "mismatch": "expected 200 but was 500" },
          { "type": "BodyMismatch", "path": "$.ok", "expected": "true", "actual": "\"true\"", "mismatch": "..." }
        ]
      }
    }
  ],
  "interactionResults": [          // one entry per verified interaction, in verification order
    { "description": "interaction 1 - GET /one", "result": "OK", "duration": "2ms" },
    { "description": "interaction 2 - GET /two", "result": "Error", "duration": "2ms" }
  ]
}
```

## Testing Against a Local pact-js-core / pact_ffi Build

The extended per-interaction attributes (`consumer`, `provider`, `providerStates`,
`pending`, `mismatch`) come from a change to the Rust core
([pact-reference#549](https://github.com/pact-foundation/pact-reference/pull/549)).
Until that change is released and picked up by pact-js-core, the chain can be
exercised locally:

```bash
# 1. Build the FFI library from the pact-reference branch
cd <pact-reference>/rust && cargo build -p pact_ffi --release

# 2. Build the pact-js-core native module against it (macOS arm64 shown)
cd <pact-js-core>
gh release download libpact_ffi-v0.5.7 --repo pact-foundation/pact-reference \
  --pattern pact.h --pattern pact-cpp.h --dir ffi          # C headers
cp <pact-reference>/rust/target/release/libpact_ffi.dylib ffi/macos-aarch64/
# PACT_FFI_VERSION in src/ffi/index.ts must match `pactffi_version()` of that build
npx prebuildify@6.0.1 --napi --name node.napi && npm run build

# 3. Point pact-js at it
cd <pact-js> && npm install --no-save <pact-js-core>
cd examples/verification-results
PACT_PREBUILD_LOCATION=<pact-js-core> npm run capture:fixtures
```

`PACT_PREBUILD_LOCATION` makes pact-js-core load `prebuilds/<platform>/` from
that directory instead of the published platform package.

## Findings

1. **Per-interaction results exist, but carry no pact identity.** An
   `interactionResults` entry has only `description`, `result` and `duration`.
   `interactionId` is only present for broker sources and `interactionKey` only
   when the pact file contains interaction keys. With two consumers sharing an
   interaction description, the entries cannot be told apart.
2. **Consumer, provider and provider states only appear in text.** The
   `errors[].interaction` string follows the pattern
   `Verifying a pact between <consumer> and <provider>[ Given <state>[ And <state>...]] - <description>`
   and the `output` lines start each pact with `Verifying a pact between ...`.
   Both are parseable, but only `errors` is machine oriented and it covers
   failed interactions only.
3. **Mismatches are not attached to the interaction result.** They live in
   `errors[]` and have to be joined via the description text.
4. **Success and failure travel on different channels.** The same JSON arrives
   either as the resolved value or as `Error.message`, so a consumer of the
   result has to handle both.
5. **`duration` is a formatted string** (`"15ms"`), not a number.

These gaps define the follow-up work: extending `VerificationInteractionResult`
in `pact_verifier` (consumer, provider, provider states, pending flag,
mismatches) so that the JSON is self-describing, and giving pact-js a typed
result plus a suite adapter that turns it into `describe`/`it` blocks.
