# XML

You can write both consumer and provider verification tests with XML requests or responses.

## Support

| Role      | Interface            | Supported? |
|:---------:|:--------------------:|:----------:|
| Consumer | `Pact` / `PactV4`     |     ❌      |
| Consumer | `MessageConsumerPact` |     ✅      |
| Consumer | `PactV2`              |     ❌      |
| Consumer | `PactV3`              |     ✅      |
| Provider | `Verifier`            |     ✅      |
| Provider | `MessageProviderPact` |     ✅      |

## API

The `XmlBuilder` class provides a DSL to help construct XML bodies with matching rules and generators. The generated JSON from the builder can be used as bodies in both Message and HTTP tests.

## Example


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

For a more detailed example, see the todo-consumer project, specifically [consumer.spec.js](https://github.com/pact-foundation/pact-js/blob/master/examples/v3/todo-consumer/test/consumer.spec.js), [provider.spec.js](https://github.com/pact-foundation/pact-js/blob/master/examples/v3/e2e/todo-consumer/provider.spec.js) in the examples folder.
