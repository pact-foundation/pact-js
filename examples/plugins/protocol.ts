/**
 * MATT protocol codec.
 *
 * MATT is a **fictional** wire format invented solely for this demonstration.
 * It is not a real protocol — do not use it for anything other than learning
 * the Pact plugin API.
 *
 * The encoding rule is trivially simple: wrap the payload with the literal
 * string "MATT" on each side.
 *
 *   encode("hello")        → "MATThelloMATT"
 *   decode("MATThelloMATT") → "hello"
 *
 * A toy protocol is used here so the example needs no gRPC runtime, no
 * protobuf compiler, and no external infrastructure. The Pact plugin API
 * (`usingPlugin`, `pluginContents`) is identical when you swap in a real
 * plugin such as `pact-protobuf-plugin` for gRPC contracts.
 */
export function parseMattMessage(raw: string): string {
  if (raw.startsWith('MATT') && raw.endsWith('MATT')) {
    return raw.slice(4, -4);
  }
  throw new Error(`Invalid MATT message: ${raw}`);
}

export function generateMattMessage(payload: string): string {
  return `MATT${payload}MATT`;
}
