# XML

You can write both consumer and provider verification tests with XML requests or responses.

## When to use XML matching

Use `XmlBuilder` when the provider returns (or accepts) `application/xml` content and you need to verify structure rather than just the presence of a body. XML matching is useful for SOAP services, legacy enterprise integrations, or any API that serialises data as XML. If the provider returns JSON, use the standard `body` matchers instead.

## Support

|   Role   |       Interface       | Supported? |
| :------: | :-------------------: | :--------: |
| Consumer |   `Pact` / `PactV4`   |     ✅      |
| Consumer | `MessageConsumerPact` |     ✅      |
| Consumer |       `PactV2`        |     ❌      |
| Consumer |       `PactV3`        |     ✅      |
| Provider |      `Verifier`       |     ✅      |
| Provider | `MessageProviderPact` |     ✅      |

## How it works

`XmlBuilder` produces a Pact XML body matcher — a JSON description that the Pact FFI translates back into an XML document plus matching rules. Key behaviours:

- `eachLike(elementName, attributes, childBuilder, options)` asserts that one or more elements with the given name appear at the current level. It applies type-based matching to each child, so the provider can return any number of elements as long as each one conforms to the template.
- Element **attributes** are matched by string equality unless you wrap an attribute value in a matcher (e.g. `integer(1)`). String literals are matched exactly.
- **Nested elements** are described by passing a child builder callback as the third argument to `eachLike` or `appendElement`.

## Common patterns

### Match a repeated element

```js
import { XmlBuilder } from '@pact-foundation/pact';
import { Matchers } from '@pact-foundation/pact';
const { integer, string } = Matchers;

body: new XmlBuilder("1.0", "UTF-8", "items").build((el) => {
  el.eachLike("item", { id: integer(1), name: string("Widget") });
})
```

This asserts that the response contains at least one `<item>` element whose `id` attribute is an integer and `name` attribute is a string.

### Match a specific element text value

```js
body: new XmlBuilder("1.0", "UTF-8", "response").build((el) => {
  el.appendElement("status", {}, (status) => {
    status.appendElement("code", {}, (code) => {
      code.appendText(string("OK"));
    });
  });
})
```

### Specify attributes with mixed matchers

```js
body: new XmlBuilder("1.0", "UTF-8", "order").build((el) => {
  el.setAttributes({
    id: integer(42),
    type: "PURCHASE",           // matched by exact string equality
  });
})
```

## Full example

```js
body: new XmlBuilder("1.0", "UTF-8", "ns1:projects").build((el) => {
  el.setAttributes({
    id: "1234",
    "xmlns:ns1": "http://some.namespace/and/more/stuff",
  })
  el.eachLike(
    "ns1:project",
    {
      id: integer(1),
      type: "activity",
      name: string("Project 1"),
      due: timestamp("yyyy-MM-dd'T'HH:mm:ss.SZ", "2016-02-11T09:46:56.023Z"),
    },
    (project) => {
      project.appendElement("ns1:tasks", {}, (task) => {
        task.eachLike(
          "ns1:task",
          {
            id: integer(1),
            name: string("Task 1"),
            done: boolean(true),
          },
          null,
          { examples: 5 }
        )
      })
    },
    { examples: 2 }
  )
})
```

For a full working example including consumer and provider tests, see the [examples/xml](https://github.com/pact-foundation/pact-js/tree/master/examples/xml/) directory. You can also refer to the todo-consumer project: [consumer.spec.js](https://github.com/pact-foundation/pact-js/blob/master/examples/v3/todo-consumer/test/consumer.spec.js) and [provider.spec.js](https://github.com/pact-foundation/pact-js/blob/master/examples/v3/e2e/todo-consumer/provider.spec.js).
