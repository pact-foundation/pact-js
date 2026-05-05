# Matching

## The fundamental tension

A pact file records what the consumer expects. But "what the consumer expects" is rarely a single exact value. The consumer expects the `id` field to be an integer — not specifically `42`. It expects `createdAt` to be a timestamp string — not specifically `"2024-01-15T09:30:00Z"`.

Matchers let you express that intent precisely. Without them, your contract becomes a snapshot test: any change to example values breaks verification, even when the provider is behaving correctly.

## Exact matching vs structural matching

**Exact matching** compares byte-for-byte. The contract says `{ "id": 1, "name": "Alice" }` and the provider must return exactly that. This is brittle. If the provider generates a real ID (say, `42`), the contract fails — not because the provider is broken, but because the example value was wrong.

**Structural matching** (via matchers) compares shape and type. The contract says "an object with an integer `id` and a string `name`". The provider can return `{ "id": 42, "name": "Bob" }` and the contract passes.

```typescript
import { Matchers } from '@pact-foundation/pact';
const { like, integer } = Matchers;

// Exact: breaks if the provider returns id: 42 or name: "Bob"
builder.jsonBody({ id: 1, name: 'Alice' });

// Structural: passes for any integer id and any string name
builder.jsonBody(like({ id: integer(1), name: like('Alice') }));
```

## The three matcher families

**Type matchers** validate shape:

- `like(value)` — the value must have the same type as the example. For objects, every key in the example must be present with the same types.
- `eachLike(value)` — the response must be a non-empty array where every element matches the example's shape.

**String matchers** validate format:

- `regex(pattern, example)` — the value must match the regular expression.
- `email(example?)` — shorthand for an email address regex.
- `uuid(example?)` — shorthand for a UUID regex.

**Number matchers** validate numeric type:

- `integer(example?)` — the value must be a whole number.
- `decimal(example?)` — the value must be a floating-point number.

## Generators

Matchers constrain what the *provider* returns during verification. Generators provide *example values* for the *consumer* mock during consumer testing.

When you write `integer(1)`, the `1` is the generator: it is the value the mock server returns to your consumer code. The contract records "must be an integer" — not "must be 1". The provider may return any integer and pass.

You rarely need to configure generators manually. Every matcher accepts an example value that doubles as the generator. Only reach for standalone generators (from `@pact-foundation/pact` exports like `fromProviderState`) when you need the provider to inject a value at verification time — for example, a database-generated ID.

## When to use `like` vs exact

Use `like` (or a more specific matcher) when the value **legitimately varies** between provider implementations:
- Database-generated IDs (`id`, `uuid`)
- Server-generated timestamps (`createdAt`, `updatedAt`)
- Free-text fields (`name`, `description`, `message`)

Use **exact values** when the consumer **branches on the value**:
- HTTP status codes — your client behaves differently on `200` vs `404`
- Type discriminants — `{ "type": "admin" }` vs `{ "type": "user" }`
- Enum values the consumer maps to application logic

If the consumer does not use a field at all, omit it from the contract entirely. The provider is then free to change it without any contract involvement.
