# How Pact Works

## The core insight

In a conventional integration test, you start the consumer and the provider together, run a request through both, and check the result. This creates a hard dependency: neither side can test without the other. As services multiply, coordinating shared test environments becomes the bottleneck.

Consumer-driven contract testing inverts this. The consumer defines what it *needs* — not what the provider *currently* returns. That definition becomes a contract. The provider proves it honours the contract independently, without the consumer present.

## The three-role model

**Consumer** — any service that calls another: a frontend, a microservice, a mobile app. The consumer writes a test that records what it sends and minimally expects back.

**Provider** — the service being called. The provider runs the recorded interactions against its real implementation to prove it meets the consumer's expectations.

**Pact Broker** — a central store for pact files. Teams share contracts through it, and it tracks which versions have been verified. For simple setups you can share files on disk.

## What a pact file is

A pact file is a JSON document. Each entry records one interaction:

- **given** — a provider state that must be true before the interaction runs (e.g. "a user with ID 1 exists")
- **uponReceiving** — a description of the request
- **withRequest** — the exact request: method, path, headers, body
- **willRespondWith** — the minimum acceptable response: status code, headers, body shape

The file is produced by the consumer's test suite. The provider never writes to it.

## The workflow

```
┌─────────────┐     pact file     ┌──────────────┐     pact file     ┌─────────────────┐
│  Consumer   │ ───────────────►  │  Pact Broker │ ───────────────►  │    Provider     │
│    test     │                   │  (or disk)   │                   │  verification   │
└─────────────┘                   └──────────────┘                   └─────────────────┘
      │                                                                       │
  generates                                                              replays each
  pact file                                                              interaction
                                                                        against the
                                                                        real provider
```

1. **Consumer test runs.** Pact starts a mock server. Your client code runs against it; Pact records the interaction and writes the pact file.
2. **Pact file is shared.** Via the broker, or by copying the file to the provider's repository.
3. **Provider verification runs.** `Verifier` replays each recorded request against the real provider and checks the response matches.
4. **Both sides can deploy.** Once verification passes, both teams can release independently.

## Why this beats shared integration environments

- **No coordination overhead.** Consumer and provider test suites run independently in any order.
- **No environment coupling.** A flaky database on the provider side cannot fail the consumer's build.
- **Works across team boundaries.** The pact file is the communication channel; teams work asynchronously.
- **Precise failure messages.** When a contract breaks, you know exactly which interaction failed and why.
