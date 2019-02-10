import { ApolloClient } from "apollo-boost"
import { InMemoryCache } from "apollo-cache-inmemory"
import gql from "graphql-tag"
import { createHttpLink } from "apollo-link-http"

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createHttpLink({
    fetch: require("node-fetch"),
    headers: {
      foo: "bar",
    },
    uri: "http://localhost:4000/graphql",
  }),
})

export function query(): any {
  return client
    .query({
      query: gql`
        query HelloQuery {
          hello
        }
      `,
      variables: {
        foo: "bar",
      },
    })
    .then((result: any) => result.data)
}
