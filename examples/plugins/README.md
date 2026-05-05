# Plugins Example

This example demonstrates Pact's plugin system, which extends contract testing to custom protocols and content types beyond standard HTTP+JSON. The example uses the **MATT plugin**; a deliberately trivial, fictional protocol that exists purely to keep this example self-contained (no gRPC runtime, no schema registry, no external infrastructure required).

## About the MATT Protocol

MATT is a **fictional wire format** invented for demonstration purposes. It is not a real protocol you would ever use in production. Its entire encoding rule is:

```text
encode("hello")  →  "MATThelloMATT"
decode("MATThelloMATT")  →  "hello"
```

The payload is simply wrapped with the literal string `"MATT"` on each side. That is all MATT does.

Using a toy protocol lets the example focus on the Pact plugin API — `usingPlugin()`, `pluginContents()` — without the complexity of setting up a real gRPC server or compiling protobuf schemas. The same Pact API calls apply verbatim when you swap in a real plugin such as `pact-protobuf-plugin` for gRPC contracts.

## What You'll Learn

- Using `usingPlugin()` to declare a plugin for an interaction
- `builder.pluginContents()` to define plugin-encoded request/response bodies
- How plugins integrate transparently with the standard `Verifier`
- Real-world applications: gRPC, Avro, Thrift, binary protocols

## Running the Example

```bash
npm install   # also installs the matt plugin via pretest hook
npm test
```

The `pretest` hook installs the `matt` Pact plugin into `~/.pact/plugins/`. This only needs to happen once per machine.

## How It Works

**Protocol (`protocol.ts`)** implements the MATT wire format described above. In a real plugin scenario, this would be a protobuf codec, an Avro schema, or a custom binary format — MATT is a stand-in that requires no external tooling.

**Consumer** encodes its payload with `generateMattMessage()`, sends it with `Content-Type: application/matt`, and decodes the response with `parseMattMessage()`. The Pact test uses `usingPlugin({ plugin: 'matt', version: '0.1.1' })` and `pluginContents()` to teach Pact how to match MATT-encoded bodies.

**Provider** decodes the incoming MATT body and sends a MATT-encoded response. The `Verifier` replays the pact interaction; the plugin handles the content type transparently.

The same structure works for gRPC: replace the matt plugin with `pact-protobuf-plugin` and supply a protobuf interaction specification to `pluginContents()`.

## Further Reading

- [Pact plugins overview](https://docs.pact.io/implementation_guides/javascript/docs/plugins)
- [Available plugins](https://github.com/pact-foundation/pact-plugins)
