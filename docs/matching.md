# Matching

Matching makes your tests more expressive and your tests less brittle.

Rather than use hard-coded values which must then be present on the Provider side,
you can use regular expressions and type matches on objects and arrays to validate the
structure of your APIs.

The matching rules you can use depend on the [specification] of the Pact file you need to generate

## Matching Packages

Matching rules

## V2 Matching rules

V2 only matching rules are found in the export `Matchers` of the `@pact-foundation/pact` package, and can be used with the `PactV2` dsl.

### Match common formats

Often times, you find yourself having to re-write regular expressions for common formats. We've created a number of them for you to save you the time:

<details><summary>Matchers API</summary>

| method                      | description                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `boolean`                   | Match a boolean value (using equality)                                                                                      |
| `string`                    | Match a string value                                                                                                        |
| `integer`                   | Will match all numbers that are integers (both ints and longs)                                                              |
| `decimal`                   | Will match all real numbers (floating point and decimal)                                                                    |
| `hexadecimal`               | Will match all hexadecimal encoded strings                                                                                  |
| `iso8601Date`               | Will match string containing basic ISO8601 dates (e.g. 2016-01-01)                                                          |
| `iso8601DateTime`           | Will match string containing ISO 8601 formatted dates (e.g. 2015-08-06T16:53:10+01:00)                                      |
| `iso8601DateTimeWithMillis` | Will match string containing ISO 8601 formatted dates, enforcing millisecond precision (e.g. 2015-08-06T16:53:10.123+01:00) |
| `rfc3339Timestamp`          | Will match a string containing an RFC3339 formatted timestapm (e.g. Mon, 31 Oct 2016 15:21:41 -0400)                        |
| `iso8601Time`               | Will match string containing times (e.g. T22:44:30.652Z)                                                                    |
| `ipv4Address`               | Will match string containing IP4 formatted address                                                                          |
| `ipv6Address`               | Will match string containing IP6 formatted address                                                                          |
| `uuid`                      | Will match strings containing UUIDs                                                                                         |
| `email`                     | Will match strings containing Email address                                                                                 |

</details>

### Match based on type

```javascript
const { like, string } = Matchers;

provider.addInteraction({
  state: 'Has some animals',
  uponReceiving: 'a request for an animal',
  withRequest: {
    method: 'GET',
    path: '/animals/1',
  },
  willRespondWith: {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      id: 1,
      name: string('Billy'),
      address: like({
        street: '123 Smith St',
        suburb: 'Smithsville',
        postcode: 7777,
      }),
    },
  },
});
```

Note that you can wrap a `like` around a single value or an object. When wrapped around an object, all values and child object values will be matched according to types, unless overridden by something more specific like a `term`.

[flexible-matching]: https://github.com/realestate-com-au/pact/wiki/Regular-expressions-and-type-matching-with-Pact

### Match based on arrays

Matching provides the ability to specify flexible length arrays. For example:

```javascript
pact.eachLike(obj, { min: 3 });
```

Where `obj` can be any javascript object, value or Pact.Match. It takes optional argument (`{ min: 3 }`) where min is greater than 0 and defaults to 1 if not provided.

Below is an example that uses all of the Pact Matchers.

```javascript
const { somethingLike: like, term, eachLike } = pact;

const animalBodyExpectation = {
  id: 1,
  first_name: 'Billy',
  last_name: 'Goat',
  animal: 'goat',
  age: 21,
  gender: term({
    matcher: 'F|M',
    generate: 'M',
  }),
  location: {
    description: 'Melbourne Zoo',
    country: 'Australia',
    post_code: 3000,
  },
  eligibility: {
    available: true,
    previously_married: false,
  },
  children: eachLike({ name: 'Sally', age: 2 }),
};

// Define animal list payload, reusing existing object matcher
// Note that using eachLike ensure that all values are matched by type
const animalListExpectation = eachLike(animalBodyExpectation, {
  min: MIN_ANIMALS,
});

provider.addInteraction({
  state: 'Has some animals',
  uponReceiving: 'a request for all animals',
  withRequest: {
    method: 'GET',
    path: '/animals/available',
  },
  willRespondWith: {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: animalListExpectation,
  },
});
```

### Match by regular expression

If none of the above matchers or formats work, you can write your own regex matcher.

The underlying mock service is written in Ruby, so the regular expression must be in a Ruby format, not a Javascript format.

```javascript
const { term } = pact;

provider.addInteraction({
  state: 'Has some animals',
  uponReceiving: 'a request for an animal',
  withRequest: {
    method: 'GET',
    path: '/animals/1',
  },
  willRespondWith: {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      id: 100,
      name: 'billy',
      gender: term({
        matcher: 'F|M',
        generate: 'F',
      }),
    },
  },
});
```

## V3 Matching rules

V3 only matching rules are found in the export `MatchersV3` of the `@pact-foundation/pact` package, and can be used with `PactV3` DSL.

For example:

```javascript
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const {
  eachLike,
  atLeastLike,
  integer,
  timestamp,
  boolean,
  string,
  regex,
  like,
} = MatchersV3;

const animalBodyExpectation = {
  id: integer(1),
  available_from: timestamp("yyyy-MM-dd'T'HH:mm:ss.SSSX"),
  first_name: string('Billy'),
  last_name: string('Goat'),
  animal: string('goat'),
  age: integer(21),
  gender: regex('F|M', 'M'),
  location: {
    description: string('Melbourne Zoo'),
    country: string('Australia'),
    post_code: integer(3000),
  },
  eligibility: {
    available: boolean(true),
    previously_married: boolean(false),
  },
  interests: eachLike('walks in the garden/meadow'),
};
```

| Matcher                | Parameters                                         | Description                                                                                                                                                                                                                                                                                                                             |
|------------------------|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `like`                 | template                                           | Applies the `type` matcher to value, which requires values to have the same type as the template                                                                                                                                                                                                                                        |
| `eachLike`             | template, min: number = 1                          | Applies the `type` matcher to each value in an array, ensuring they match the template. Note that this matcher does validate the length of the array to be at least one by default, as the contents of the array might otherwise never be matched.                                                                                      |
| `atLeastOneLike`       | template, count: number = 1                        | Behaves like the `eachLike` matcher, but also applies a minimum length validation of one on the length of the array. The optional `count` parameter controls the number of examples generated.                                                                                                                                          |
| `atLeastLike`          | template, min: number, count?: number              | Just like `atLeastOneLike`, but the minimum length is configurable.                                                                                                                                                                                                                                                                     |
| `atMostLike`           | template, max: number, count?: number              | Behaves like the `eachLike` matcher, but also applies a maximum length validation on the length of the array. The optional `count` parameter controls the number of examples generated.                                                                                                                                                 |
| `constrainedArrayLike` | template, min: number, max: number, count?: number | Behaves like the `eachLike` matcher, but also applies a minimum and maximum length validation on the length of the array. The optional `count` parameter controls the number of examples generated.                                                                                                                                     |
| `boolean`              | example: boolean                                   | Matches boolean values (true, false)                                                                                                                                                                                                                                                                                                    |
| `integer`              | example?: number                                   | Value that must be an integer (must be a number and have no decimal places). If the example value is omitted, a V3 Random number generator will be used.                                                                                                                                                                                |
| `decimal`              | example?: number                                   | Value that must be a decimal number (must be a number and have at least one digit in the decimal places). If the example value is omitted, a V3 Random number generator will be used.                                                                                                                                                   |
| `number`               | example?: number                                   | Value that must be a number. If the example value is omitted, a V3 Random number generator will be used.                                                                                                                                                                                                                                |
| `string`               | example: string                                    | Value that must be a string.                                                                                                                                                                                                                                                                                                            |
| `regex`                | pattern, example: string                           | Value that must match the given regular expression.                                                                                                                                                                                                                                                                                     |
| `equal`                | example                                            | Value that must be equal to the example. This is mainly used to reset the matching rules which cascade.                                                                                                                                                                                                                                 |
| `timestamp`            | format: string, example?: string                   | String value that must match the provided datetime format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html) for details on the format string. If the example value is omitted, a value will be generated using a Timestamp generator and the current system date and time. |
| `time`                 | format: string, example?: string                   | String value that must match the provided time format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html) for details on the format string. If the example value is omitted, a value will be generated using a Time generator and the current system time.                   |
| `date`                 | format: string, example?: string                   | String value that must match the provided date format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html) for details on the format string. If the example value is omitted, a value will be generated using a Date generator and the current system date.                   |
| `includes`             | value: string                                      | Value that must include the example value as a substring.                                                                                                                                                                                                                                                                               |
| `nullValue`            |                                                    | Value that must be null. This will only match the JSON Null value. For other content types, it will match if the attribute is missing.                                                                                                                                                                                                  |
| `arrayContaining`      | variants...                                        | Matches the items in an array against a number of variants. Matching is successful if each variant occurs once in the array. Variants may be objects containing matching rules.                                                                                                                                                         |
| `eachKeyMatches`       | example: object, rules: Matcher[]                  | Object where the _keys_ must match the supplied matching rules and the values are ignored.                                                                                                                                                                                                                                              |
| `eachValueMatches`     | example: object, rules: Matcher[]                  | Object where the _values_ must match the supplied matching rules and keys are ignored.                                                                                                                                                                                                                                                  |
| `fromProviderState`    | expression: string, exampleValue: string           | Sets a type matcher and a provider state generator. See the section below.                                                                                                                                                                                                                                                              |

#### Array contains matcher

The array contains matcher function allows you to match the actual list against a list of required variants. These work
by matching each item against each of the variants, and the matching succeeds if each variant matches at least one item. Order of
items in the list is not important.

The variants can have a totally different structure, and can have their own matching rules to apply. For an example of how
these can be used to match a hypermedia format like Siren, see [Example Pact + Siren project](https://github.com/pactflow/example-siren), hosted by our friends at [PactFlow](https://pactflow.io/).

| function          | description                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arrayContaining` | Matches the items in an array against a number of variants. Matching is successful if each variant occurs once in the array. Variants may be objects containing matching rules. |

```js
{
  "actions": arrayContaining([
    {
      "name": "update",
      "method": "PUT",
      "href": url("http://localhost:9000", ["orders", regex("\\d+", "1234")])
    },
    {
      "name": "delete",
      "method": "DELETE",
      "href": url("http://localhost:9000", ["orders", regex("\\d+", "1234")])
    }
  ])
}
```

#### Provider State Injected Values

The `fromProviderState` matching function allows values to be generated based on values returned from the provider state callbacks. This should be used for the cases were database entries have auto-generated values and these values need to be used in the URLs or query parameters.

For an example, see [examples/v3/provider-state-injected](https://github.com/pact-foundation/pact-js/tree/master/examples/v3/provider-state-injected).

For this to work, in the consumer test we use the `fromProviderState` matching function which takes an expression and an example value. The example value will be used in the consumer test.

For example:

```js
  query: { accountNumber: fromProviderState("${accountNumber}", "100") },
```

Then when the provider is verified, the provider state callback can return a map of values. These values will be used to generate the value using the expression supplied from the consumer test.

For example:

```js
stateHandlers: {
  "Account Test001 exists": (params) => {
    const account = new Account(0, 0, "Test001", params.accountRef, new AccountNumber(0), Date.now(), Date.now())
    const persistedAccount = accountRepository.save(account)
    return { accountNumber: persistedAccount.accountNumber.id }
  }
},
```

## A note about typescript

Because of the way interfaces work in typescript, if you are
passing a typed object to a matcher, and that type is an interface (say `Foo`):

```javascript
interface Foo {
  a: string;
}

const f: Foo = { a: "broken example" };


provider.addInteraction({
  uponReceiving: "a post with foo",
  withRequest: {
    method: "POST",
    path: "/",
    body: like(f) // Type 'Matcher<Foo>' is not assignable to type 'AnyTemplate'.
  },
  ...
})
```

then you may run into the following message:

```
Type 'Matcher<Foo>' is not assignable to type 'AnyTemplate'.
```

This is one of the rare places where `type` differs from `interface`. You have two options:

1. Use `type Foo = {` instead of `interface Foo {`
2. If this is not possible, Pact exports a workaround wrapper type called `InterfaceToTemplate<YourTypeHere>`. Use it like this:
   ```
   const f: InterfaceToTemplate<Foo> = { a: "working example" };
   ```

[specification]: https://github.com/pact-foundation/pact-specification
