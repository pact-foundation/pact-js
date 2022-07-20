# XML

You can write both consumer and provider verification tests with XML requests or responses. 

## Support

| Role      | Interface            | Supported? |
|:---------:|:--------------------:|:----------:|
| Consumer | `Pact`                |     ❌      |
| Consumer | `MessageConsumerPact` |     ✅      |
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

#### Provider state callbacks

Provider state callbacks have been updated to support parameters and return values.

Simple callbacks run before the verification and receive optional parameters containing any key-value  parameters defined in the pact file.

The second form of callback accepts a `setup` and `teardown` function that execute on the lifecycle of the state setup. `setup` runs prior to the test, and `teardown` runs after the actual request has been sent to the provider.

Provider state callbacks can also return a map of key-value values. These are used with provider-state injected values (see the section on that above).

```javascript
stateHandlers: {
  // Simple state handler, runs before the verification
  "Has no animals": () => {
    return animalRepository.clear()
  },
  // Runs only on setup phase (no teardown)
  "Has some animals": {
    setup: () => {
      return importData()
    }
  },
  // Runs only on teardown phase (no setup)
  "Has a broken dependency": {
    setup: () => {
      // make some dependency fail...
      return Promise.resolve()
    },
    teardown: () => {
      // fix the broken dependency!
      return Promise.resolve()
    }
  },
  // Return provider specific IDs
  "Has an animal with ID": async (parameters) => {
    await importData()
    animalRepository.first().id = parameters.id
    return {
      description: `Animal with ID ${parameters.id} added to the db`,
      id: parameters.id,
    }
  },
```

For a more detailed example, see the TODO project in the examples folder.