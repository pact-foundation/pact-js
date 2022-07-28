## GraphQL API

GraphQL is simply an abstraction over HTTP and may be tested via Pact. 

## Support

| Role      | Interface            | Supported? |
|:---------:|:--------------------:|:----------:|
| Consumer | `Pact`                |     ✅      |
| Consumer | `MessageConsumerPact` |     ❌      |
| Consumer | `PactV3`              |     ❌      |
| Provider | `Verifier`            |     ✅      |
| Provider | `MessageProviderPact` |     ❌      |

### API

There are two wrapper APIs available for GraphQL specific testing: `GraphQLInteraction` and `ApolloGraphQLInteraction` that can be used as a drop-in replacement for the `addInteraction` method.

These are both lightweight wrappers over the standard DSL in order to make GraphQL testing a bit nicer.