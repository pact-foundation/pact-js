# Matchers Example

This example demonstrates Pact's full matcher library. The provider intentionally returns **different values** than the consumer's examples to prove that matchers check structure and types — not specific values.

## What You'll Learn

| Matcher            | Matches                                        |
| ------------------ | ---------------------------------------------- |
| `like()`           | any value of the same type                     |
| `integer()`        | any JSON integer                               |
| `decimal()`        | any floating-point number                      |
| `string()`         | any string                                     |
| `regex()`          | a string against a regular expression          |
| `datetime()`       | a string against a date/time format            |
| `eachLike()`       | an array where every element has this shape    |
| `eachKeyMatches()` | a dictionary where every key matches a pattern |

## Running the Example

```bash
npm install
npm test
```

## How It Works

**Consumer** defines three interactions covering a Product API with diverse field types. Every field uses a matcher rather than an exact value; for example, `price: decimal(9.99)` means "any decimal", not "must be 9.99".

**Provider** returns data with completely different values: product ID 99, category 'gadgets', two tags instead of one. All three interactions still verify successfully, because the contract only cares about type and structure.

This is the practical benefit of matchers: your contract survives normal provider data changes (renaming a product, adjusting a price) without needing to be updated.

## Further Reading

- [Matching in Pact](https://docs.pact.io/implementation_guides/javascript/docs/matching)
